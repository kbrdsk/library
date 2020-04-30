let params = (new URL(document.location)).searchParams,
   bookRef = firebase.storage().ref().child(params.get('bookRef'));

let apiKey = 'AIzaSyDwbll4zeQoctc4vI1GeE74LqMj2ioHaNg',
    apiURL = 'https://www.googleapis.com/books/v1/volumes/';

let bookTitle = document.getElementById('book-title'),
    bookAuthor = document.getElementById('book-author'),
    coverImage = document.getElementById('cover-image'),
    bookDescription = document.getElementById('book-description');

bookRef.getDownloadURL().then(function(url){
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();

  let lookupObj = JSON.parse(xhr.response);

  let query = lookupObj['isbn'] 
           || `${lookupObj['title']}+inauthor:${lookupObj['author']['last']}`;

  xhr.open('GET', `${apiURL}?q=${query}&key=${apiKey}`, false);
  xhr.send();
  
  let bookObj = JSON.parse(xhr.response)['items'][0]['volumeInfo'];
  
  bookTitle.textContent = bookObj.title;
  bookAuthor.textContent = bookObj.authors[0];
  coverImage.src = bookObj.imageLinks.thumbnail;
  bookDescription.textContent = bookObj.description;

  console.log(bookObj);
});