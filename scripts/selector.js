let name,
	nameInput = document.getElementById('username-input'),
	toButton = document.getElementById('to-library-button'),
	newButton = document.getElementById('new-library-button'),
	selectorForm = document.getElementById('library-selector-form'),
	existingLibraryError = document.getElementById('existing-libary-error');

nameInput.addEventListener('change', updateName);
toButton.addEventListener('mousedown', goToLibrary);
newButton.addEventListener('click', newLibrary);

let libraryRef = firebase.storage().ref();

function updateName(){
  name = nameInput.value;
}

function goToLibrary(){
  updateName();
  let indexRef = libraryRef.child(`${name}/index`);
  indexRef.getDownloadURL().then(
      result => {      
        let queryString = `?name=${name}`;
        window.location.href = 'library.html' + queryString;
      },
      error => {alert("A library with that name doesn't exist.")}
  );
}

function newLibrary(){
  updateName();
  let indexRef = libraryRef.child(`${name}/index`);
  indexRef.getDownloadURL().then(
      result => {alert('A library with that name already exists.');},
      error => {
          if(error.code_ === 'storage/object-not-found'){
            indexRef.putString('');
          }
      }
  );
}

function checkExistingLibrary(){

}