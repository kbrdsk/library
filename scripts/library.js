let params = (new URL(document.location)).searchParams,
	name = params.get('name');

let title = document.getElementById('library-name');
title.textContent = name;

let myLibrary = [];

function Book(author, title, pages, read, isbn){
  if(!(author instanceof Author)) throw 'must input valid author';
  this.author = author; 
  this.title = title;
  this.pages = pages;
  this.read = read;
  this.isbn = isbn;
}

function Author(firstName, lastName){
  this.first = firstName;
  this.last = lastName;
}

function addBookToLibrary(book){
  myLibrary.push(book);
}


