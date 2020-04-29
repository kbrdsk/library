let params = (new URL(document.location)).searchParams,
    name = params.get('name');

let libraryName = document.getElementById('library-name');
libraryName.textContent = name;
libraryName.addEventListener('click', showAllListings);

let bookDisplay = document.getElementById('book-list');

let addBookLink = document.getElementById('add-book-link');
addBookLink.addEventListener('click', showCreateBookForm);

let addBookPopup = document.getElementById('add-book-popup');

let addBookSubmit = document.getElementById('add-book-submit');
addBookSubmit.addEventListener('click', createBook);

let libraryRef = firebase.storage().ref().child(`${name}`),
    indexRef = libraryRef.child('index');

let books = [],
  bookListings = [];


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
               displayBooks(bookListings);
       });
    }
});

function getRegisteredBooks(index){
  return new Promise(function(resolve, reject){
  	  setTimeout(() => reject(new Error('timeout')), 2000);
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

function Author(lastName = '', firstName = ''){
  this.first = firstName;
  this.last = lastName;
  this.equals = (author) => {
      return author.first === this.first 
          && author.last === this.last;
  }
}

function registerBook(book){
  let ref = libraryRef.child(book.ref);

  ref.putString(JSON.stringify(book));

  indexRef.getDownloadURL().then(function(url){
  	let xhr = new XMLHttpRequest();
  	xhr.open('GET', url, false);
  	xhr.send();
  	let index = xhr.response;
    index += `${book.ref}\n`;
    indexRef.putString(index);
  })
}

function parseBook(str){
  let bookData = JSON.parse(str);
  let author = new Author(bookData.author.last, bookData.author.first);
  return new Book(author, bookData.title, bookData.pages, bookData.read, bookData.isbn);
}

function addBookToLibrary(book){
  registerBook(book);
  books.push(book);
  books.sort(compareBooks);
}

function showCreateBookForm(){
  addBookPopup.hidden = false;
}

function createBook(){
  let author = new Author(document.getElementById('add-author-last').value,
                            document.getElementById('add-author-first').value);
  let book = new Book(author,
                        document.getElementById('add-title').value,
                        document.getElementById('add-pages').value,
                        document.getElementById('add-read').value,
                        document.getElementById('add-isbn').value);

  addBookToLibrary(book);
  bookListings.push(createBookListing(book));

  addBookPopup.hidden = true;
  resetBookForm();

  displayBooks(bookListings);
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
  let listing = document.createElement('div'),
      titleLink = document.createElement('a'),
      authorLink = document.createElement('a'),
      infoLink = document.createElement('a'),
      deleteLink = document.createElement('a');

  listing.classList.add('book-listing');
  listing.book = book;

  titleLink.classList.add('title-link');
  titleLink.classList.add('listing-element');
  titleLink.textContent = book.title;
  titleLink.href = '#';

  authorLink.classList.add('author-link');
  authorLink.classList.add('listing-element');
  authorLink.textContent = `${book.author.last}, ${book.author.first}`;
  authorLink.addEventListener('click', () => filterByAuthor(book.author));
  authorLink.href = '#';

  infoLink.classList.add('info-link');  
  infoLink.classList.add('listing-element'); 
  infoLink.textContent = 'info';
  infoLink.addEventListener('click', () => showBookInfo(book.ref));
  infoLink.href = '#';

  deleteLink.classList.add('delete-link');
  deleteLink.classList.add('listing-element');
  deleteLink.textContent = 'delete';
  deleteLink.addEventListener('click', () => deleteListing(listing));
  deleteLink.href = '#';

  for(let node of [titleLink, authorLink, infoLink, deleteLink]){
      listing.appendChild(node);
  }

  return listing;
}

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

function filterByAuthor(author){
  for(let listing of bookListings){
      bookDisplay.removeChild(listing);
  }
  let filteredListings = 
      bookListings.filter(listing => listing.book.author.equals(author));
  displayBooks(filteredListings);
}

function showAllListings(){
    displayBooks(bookListings);
}

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