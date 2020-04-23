let myLibrary = [];

function Book(...args){
  [this.author, 
  this.title, 
  this.pages, 
  this.read, 
  this.isbn] = args;
}

function addBookToLibrary(book){
  myLibrary.push(book);
}