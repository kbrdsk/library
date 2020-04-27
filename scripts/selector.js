let name,
	nameInput = document.getElementById('username-input'),
	toButton = document.getElementById('to-library-button'),
	newButton = document.getElementById('new-library-button'),
	selectorForm = document.getElementById('library-selector-form'),
	existingLibraryError = document.getElementById('existing-libary-error');

nameInput.addEventListener('change', updateName);
toButton.addEventListener('mousedown', goToLibrary);
newButton.addEventListener('click', newLibrary)

function updateName(){
	name = nameInput.value;
}

function goToLibrary(){
	updateName();
	let queryString = `?name=${name}`;
	window.location.href = 'library.html' + queryString;
}

function newLibrary(){

}

function checkExistingLibrary(){

}