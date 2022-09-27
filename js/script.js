const books = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addbook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
})

function addbook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    
    const generatedID = generateId();
    const bookObject = generatebookObject(generatedID, title, author, year, false);
    books.push(bookObject);

    document.getElementById('title').value = "";
    document.getElementById('author').value = "";
    document.getElementById('year').value = "";
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generatebookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBook = document.getElementById('unread-books');
    uncompletedBook.innerHTML = '';
    
    const completedBook = document.getElementById('read-books');
    completedBook.innerHTML = '';

    let uncomplete = 0;
    let completed = 0;
    
    for (const book of books) {
        const bookElement = renderBookItem(book);
        if (!book.isComplete){
            uncompletedBook.append(bookElement);
            uncomplete++;
        }else{
            completedBook.append(bookElement);
            completed++;
        }
    }

    if(uncomplete == 0){
        uncompletedBook.append(renderEmpty(false));
    }
    if(completed == 0){
        completedBook.append(renderEmpty());
    }
});

function renderEmpty(isComplete = true){
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-center');

    if(isComplete){
        textContainer.innerText = "Yuk Lanjutin Baca !";
    }else{
        textContainer.innerText ="Nice, Semua Buku Sudah Dibaca !";
    }

    return textContainer;
}

function renderBookItem(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title + " ("+bookObject.year+")";
    
    const textAuthor = document.createElement('div');
    textAuthor.innerText = bookObject.author;
    
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor);
    
    const container = document.createElement('div');
    container.classList.add('item', 'border', bookObject.isComplete ? 'bg-secondary' : 'bg-read');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');    
    trashButton.addEventListener('click', function () {
        removeTaskFromCompleted(bookObject.id);
    });
    
    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });
        
        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });
        
        container.append(checkButton, trashButton);
    }
    
    return container;
}

function addTaskToCompleted (bookId) {
    const bookTarget = findbook(bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findbook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findbookIndex(bookId);
    
    if (bookTarget === -1) return;
    
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function undoTaskFromCompleted(bookId) {
    const bookTarget = findbook(bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findbookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    
    return -1;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}