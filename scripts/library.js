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

let testRef = libraryRef.child('1223');
testRef.getDownloadURL().then(function(url){
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send();
	console.log(xhr.response);
})

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
}

function getBook(str){
  let bookData = JSON.parse(str);
  let author = new Author(bookData.author.last, bookData.author.first);
  return new Book(author, bookData.title, bookData.pages, bookData.read, bookData.isbn);
}

function addBookToLibrary(book){
  registerBook(book);
  books.push(book);
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
  createBookListing(book);

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
  titleLink.textContent = book.title;
  titleLink.href = '#';

  authorLink.classList.add('author-link');
  authorLink.textContent = `${book.author.last}, ${book.author.first}`;
  authorLink.addEventListener('click', _ => filterByAuthor(book.author));
  authorLink.href = '#';

  infoLink.classList.add('info-link');  
  infoLink.textContent = 'info';
  infoLink.href = '#';

  deleteLink.classList.add('delete-link');
  deleteLink.textContent = 'delete';
  deleteLink.addEventListener('click', _ => deleteListing(listing));
  deleteLink.href = '#';

  for(let node of [titleLink, authorLink, infoLink, deleteLink]){
  	listing.appendChild(node);
  }

  bookListings.push(listing);
}

function deleteListing(listing){
  alert('Delete?');
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
  return 0;
}

let baldwin = new Author('Baldwin', 'James');
createBookListing(new Book(baldwin, "Giovanni's Room", 183, false, 341234));

displayBooks(bookListings);