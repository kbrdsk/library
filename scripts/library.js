let params = (new URL(document.location)).searchParams,
  name = params.get('name');

let title = document.getElementById('library-name');
title.textContent = name;

let bookDisplay = document.getElementById('book-list');

let addBookLink = document.getElementById('add-book-link');
addBookLink.addEventListener('click', showCreateBookForm);

let addBookPopup = document.getElementById('add-book-popup');

let addBookSubmit = document.getElementById('add-book-submit');
addBookSubmit.addEventListener('click', createBook);

let addBookForm = document.getElementById('add-book-form');

let books = [],
  bookListings = [];

function Book(author, title, pages, read, isbn){
  if(!(author instanceof Author)) throw 'must input valid author';
  this.author = author; 
  this.title = title;
  this.pages = pages;
  this.read = read;
  this.isbn = isbn;
}

function Author(lastName, firstName){
  this.first = firstName;
  this.last = lastName;
}

function addBookToLibrary(book){
  books.push(book);
}

function showCreateBookForm(){
  addBookPopup.hidden = false;
}

function createBook(){
  addBookPopup.hidden = true;
}

function createBookListing(book){
  let listing = document.createElement('div'),
      titleLink = document.createElement('a'),
      authorLink = document.createElement('a'),
      infoLink = document.createElement('a'),
      deleteLink = document.createElement('a');

  listing.classList.add('book-listing');

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
  alert(`${author.first} ${author.last}`);
}

function displayBooks(){
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

displayBooks();