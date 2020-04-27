let params = (new URL(document.location)).searchParams,
	name = params.get('name');

let title = document.getElementById('library-name');
title.textContent = name;

let bookList = [];

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
  bookList.push(book);
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