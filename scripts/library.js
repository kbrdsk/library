let params = (new URL(document.location)).searchParams,
  name = params.get('name');

let title = document.getElementById('library-name');
title.textContent = name;

let bookDisplay = document.getElementById('book-list');

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

  infoLink.classList.add('info-link');  
  infoLink.textContent = 'info';
  infoLink.href = '#';

  deleteLink.classList.add('delete-link');
  deleteLink.textContent = 'delete';
  deleteLink.addEventListener('click', _ => deleteListing(listing));

  for(let node of [titleLink, authorLink, infoLink, deleteLink]){
  	listing.appendChild(node);
  }

  bookListings.push(listing);
}

function deleteListing(listing){

}

function filterByAuthor(author){
	
}

function displayBooks(){
  let lastNode = document.getElementById('add-book-link');
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

let baldwin = new Author('James', 'Baldwin');
createBookListing(new Book(baldwin, "Giovanni's Room", 183, false, 341234));

displayBooks();