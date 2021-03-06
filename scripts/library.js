//Main window element declarations

let params = (new URL(document.location)).searchParams,
    name = params.get('name');

let books = [],
  bookListings = [];

let libraryName = document.getElementById('library-name');
libraryName.textContent = name;
libraryName.addEventListener('click', showAllListings);

let bookDisplay = document.getElementById('book-list').querySelector('tbody');

let searchBar = document.getElementById('search-bar');

let searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', search);

let loginLink = document.getElementById('log-in-link');
loginLink.addEventListener('click', userLogin);

let logoutLink = document.getElementById('log-out-link');
logoutLink.addEventListener('click', logout);

let settingsButton = document.getElementById('settings-button');
settingsButton.addEventListener('click', showSettingsPopup);

let addBookButton = document.getElementById('add-book-button');
addBookButton.addEventListener('click', showCreateBookForm);

let addBookLink = document.getElementById('add-book-listing');
addBookLink.addEventListener('click', showCreateBookForm);


//Settings popup declarations
let settingsPopup = document.getElementById('settings-popup');

let changePasswordButton = document.getElementById('change-password-button');
changePasswordButton.addEventListener('click', changePassword);

let deleteLibraryButton = document.getElementById('delete-library-button');
deleteLibraryButton.addEventListener('click', deleteLibrary);

let closeSettingsButton = document.getElementById('close-settings-button');
closeSettingsButton.addEventListener('click', closeSettingsPopup);



//Book info popup declarations

let bookInfoPopup = document.getElementById('add-book-popup');

let bookInfoSubmitButton = document.getElementById('add-book-submit');
bookInfoSubmitButton.addEventListener('click', processBookInfo);

let bookInfoCancelButton = document.getElementById('add-book-cancel');
bookInfoCancelButton.addEventListener('click', cancelBookInfo);



//Firebase refs

let libraryRef = firebase.storage().ref().child(`${name}`),
    indexRef = libraryRef.child('index'),
    passwordRef = libraryRef.child('password');



//Get and display booklist from server on page load

indexRef.getDownloadURL().then(function(url){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    let index = xhr.response;
    if(index){
      index = index.match(/.+/g)
                   .map(i => [i, false]);
  
       getRegisteredBooks(index)
           .then(() => {
           	   books.sort(compareBooks);
               bookListings = books.map(createBookListing);
               if((document.cookie || '').match(new RegExp(`login_${name}=true`))) login();
               displayBooks(bookListings);
       });
    }
});




//Book/Author objects

function Author(lastName = '', firstName = ''){
  this.first = firstName;
  this.last = lastName;
  this.equals = (author) => {
      return author.first === this.first 
          && author.last === this.last;
  }
}

function Book(author, title, pages, read, isbn, ref){
  if(!(author instanceof Author)) throw 'must input valid author';
  this.author = author; 
  this.title = title;
  this.pages = pages;
  this.read = read;
  this.isbn = isbn;
  this.ref = ref? ref : createRef(this);
}

function createRef(book){
  if(book.isbn) return book.isbn;
  else return book.title;
}



//login/logout functions

function userLogin(){
  passwordRef.getDownloadURL().then(function(url){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();

    let password = xhr.response;

    if(password === prompt("Enter password:")) login();
    else alert('Incorrect password');
  })
}

function login(){
  addBookLink.hidden = false;
  loginLink.hidden = true;
  logoutLink.hidden = false;
  addBookButton.hidden = false;
  settingsButton.hidden = false;
  for(let listing of bookListings){
    listing.getElementsByClassName('edit-link')[0].hidden = false;
    listing.getElementsByClassName('delete-link')[0].hidden = false;
  }
  document.cookie = `login_${name}=true`;
}

function logout(){
  addBookLink.hidden = true;
  loginLink.hidden = false;
  logoutLink.hidden = true;
  addBookButton.hidden = true;
  settingsButton.hidden = true;
  settingsPopup.hidden = true;
  for(let listing of bookListings){
        listing.getElementsByClassName('edit-link')[0].hidden = true;
        listing.getElementsByClassName('delete-link')[0].hidden = true;
  }
  document.cookie = `login_${name}=false`;
}




//get/put functions for server

function registerBook(book){
  let ref = libraryRef.child(book.ref);

  ref.putString(JSON.stringify(book));

  indexRef.getDownloadURL().then(function(url){
  	let xhr = new XMLHttpRequest();
  	xhr.open('GET', url, false);
  	xhr.send();
  	let index = xhr.response;
    index += `\n${book.ref}`;
    indexRef.putString(index);
  })
}

function parseBook(str){
  let bookData = JSON.parse(str);
  let author = new Author(bookData.author.last, bookData.author.first);
  return new Book(author, bookData.title, bookData.pages, bookData.read, bookData.isbn);
}

function getRegisteredBooks(index){
  return new Promise(function(resolve, reject){
      setTimeout(() => reject(new Error('timeout')), 10000);
      for(let i in index){
        console.log(index[i][0]);
        let ref = libraryRef.child(index[i][0]);
        ref.getDownloadURL().then(function(url){
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
            let book = parseBook(xhr.response);
            books.push(book);
            index[i][1] = true;
            if(index.every(([_, loaded]) => loaded)) resolve('loaded'); 
        })
      }
  });
}



//book info popup functions

function addBookToLibrary(book){
  registerBook(book);
  books.push(book);
  books.sort(compareBooks);
}

function showCreateBookForm(){
  bookInfoPopup.hidden = false;
  bookInfoPopup.listing = null;
}

function showEditBookForm(listing){
  let book = listing.book;
  document.getElementById('add-title').value = book.title;
  document.getElementById('add-author-first').value = book.author.first;
  document.getElementById('add-author-last').value = book.author.last;
  document.getElementById('add-pages').value = book.pages;
  document.getElementById('add-read').value = book.read;
  document.getElementById('add-isbn').value = book.isbn;
  bookInfoPopup.listing = listing;
  bookInfoPopup.hidden = false;
}

function cancelBookInfo(){
  bookInfoPopup.hidden = true;
  resetBookForm();
}

function processBookInfo(){
  let isbn = document.getElementById('add-isbn').value;
  if(!isbn || isValidISBN(isbn)){
    if(!bookInfoPopup.listing) createBook();
    if(bookInfoPopup.listing) editBookInfo();
    
    bookInfoPopup.hidden = true;
    resetBookForm();
    displayBooks(bookListings);
  }
  else(alert('Please enter a valid isbn-10'));
}

function editBookInfo(){
  let book = bookInfoPopup.listing.book;
  writeBookInfo(book);
  updateListingInfo(bookInfoPopup.listing);
  libraryRef.child(book.ref).putString(JSON.stringify(book));
}

function writeBookInfo(book){
  book.author.first = document.getElementById('add-author-first').value;
  book.author.last = document.getElementById('add-author-last').value;
  book.title = document.getElementById('add-title').value;
  book.pages = document.getElementById('add-pages').value;
  book.read = document.getElementById('add-read').value;
  book.isbn = document.getElementById('add-isbn').value;
  book.ref = createRef(book);
}

function updateListingInfo(listing){
  let titleLink = listing.getElementsByClassName('title-link')[0],
      authorLink = listing.getElementsByClassName('author-link')[0];
  titleLink.textContent = listing.book.title;
  authorLink.textContent = `${listing.book.author.last}, `
             + `${listing.book.author.first}`;
}


function createBook(){
  let book = new Book(new Author());
  writeBookInfo(book);
  addBookToLibrary(book);
  let listing = createBookListing(book);
  listing.getElementsByClassName('edit-link')[0].hidden = false;
  listing.getElementsByClassName('delete-link')[0].hidden = false;
  bookListings.push(listing);
}

function resetBookForm(){
  document.getElementById('add-author-first').value = '';
  document.getElementById('add-author-last').value = '';
  document.getElementById('add-title').value = '';
  document.getElementById('add-pages').value = '';
  document.getElementById('add-read').value = '';
  document.getElementById('add-isbn').value = '';
}

function createBookListing(book){
  let listing = document.createElement('tr'),
      titleLink = document.createElement('td'),
      authorLink = document.createElement('td'),
      infoLink = document.createElement('td'),
      editLink = document.createElement('td'),
      deleteLink = document.createElement('td');

  listing.classList.add('book-listing');
  listing.book = book;

  titleLink.classList.add('title-link');
  titleLink.classList.add('listing-element');
  titleLink.textContent = book.title;
  titleLink.addEventListener('click', () => showBookInfo(book.ref));

  authorLink.classList.add('author-link');
  authorLink.classList.add('listing-element');
  authorLink.textContent = `${book.author.last}, ${book.author.first}`;
  authorLink.addEventListener('click', () => filterByAuthor(book.author));

  infoLink.classList.add('info-link');  
  infoLink.classList.add('listing-element'); 
  infoLink.textContent = 'info';
  infoLink.addEventListener('click', () => showBookInfo(book.ref));

  editLink.classList.add('edit-link');  
  editLink.classList.add('listing-element'); 
  editLink.hidden = true;
  editLink.textContent = 'edit';
  editLink.addEventListener('click', () => showEditBookForm(listing));

  deleteLink.classList.add('delete-link');
  deleteLink.classList.add('listing-element');
  deleteLink.hidden = true;
  deleteLink.textContent = 'delete';
  deleteLink.addEventListener('click', () => deleteListing(listing));

  for(let node of [titleLink, authorLink, infoLink, editLink, deleteLink]){
    listing.appendChild(node);
  }

  return listing;
}


//settings functions
function showSettingsPopup(){
  settingsPopup.hidden = false;
}

function closeSettingsPopup(){
  settingsPopup.hidden = true;
}

function changePassword(){
  passwordRef.putString(newPassword());
}

function newPassword(){
  let password = prompt('Enter new password:');
  let passwordConfirm = prompt('Confirm password:');
  if(password !== passwordConfirm) return newPassword();
  return password;
}

function deleteLibrary(){
  let confirmation = prompt(`Confirm library deletion by typing delete ${name}`);
  if(confirmation !== `delete ${name}`){
    alert('Phew, that was close!')
    return;
  } 
  libraryRef.listAll().then(function(result){
    let items = result.items.map(item => [item, false]);
    items.map((item) => {
      item[0].delete().then(function(){
        item[1] = true;
        if(items.every(([item, deleted]) => deleted)) window.location.href = 'index.html';
      })
    });
  });
}


//other library management functions

function showBookInfo(ref){
  let queryString = `?bookRef=${name}/${ref}`;
  window.location.href = 'book.html' + queryString;
}

function deleteListing(listing){
  bookListings = bookListings.filter(node => node !== listing);
  books = books.filter(book => book.ref !== listing.book.ref);
  bookDisplay.removeChild(listing);
  indexRef.getDownloadURL().then(function(url){
  	let xhr = new XMLHttpRequest();
  	xhr.open('GET', url, false);
  	xhr.send();
  	let index = xhr.response
  	               .match(/.+/g)
  	               .filter(i => i !== listing.book.ref)
  	               .join('\n');
  	indexRef.putString(index);
  });
  libraryRef.child(listing.book.ref).getDownloadURL().then(function(url){
  	let xhr = new XMLHttpRequest();
  	xhr.open('DELETE', url);
  	xhr.send();
  })
}

function showAllListings(){
  displayBooks(bookListings);
}

function filterListings(filter){
  for(let listing of bookListings){
      bookDisplay.removeChild(listing);
  }
  let filteredListings = 
      bookListings.filter(filter);
  displayBooks(filteredListings);
}

function filterByAuthor(author){
  filterListings(listing => listing.book.author.equals(author));
}

function matchSearch(listing, terms){
  let book = listing.book;
  let infoFields = [book.author.first,
                    book.author.last,
                    book.title,
                    book.isbn,
                    book.pages,
                    book.ref,
                    book.read].map(field => field.toLowerCase());
  return terms.every(term => infoFields.some(field => field.includes(term)));
}

function search(){
  showAllListings();
  let searchTerms = searchBar.value.match(/\S+/g) || [];
  searchTerms = searchTerms.map(term => term.toLowerCase());
  filterListings(listing => matchSearch(listing, searchTerms));
}



//misc helper functions

function displayBooks(bookListings){
  let lastNode = document.getElementById('add-book-listing');
  for(let listing of bookListings){
    bookDisplay.insertBefore(listing, lastNode);
  }
}

function compareBooks(book1, book2){
  if(book1.author.last < book2.author.last){
    return -1;
  }
  if(book1.author.last > book2.author.last){
    return 1;
  }
  if(book1.author.first < book2.author.first){
    return -1;
  }
  if(book1.author.first > book2.author.first){
    return 1;
  }
  if(book1.title < book2.title){
  	return -1;
  }
  if(book1.title > book2.title){
  	return 1;
  }
  return 0;
}