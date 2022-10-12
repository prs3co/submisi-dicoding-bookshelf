const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('books');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completed-books');
  completedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
    addBook();

    const titleInput = document.getElementById('title');
    titleInput.value = '';

    const authorInput = document.getElementById('author');
    authorInput.value = '';

    const yearInput = document.getElementById('year');
    yearInput.value = '';
  });

  if(isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const generateID = generateId();
  const textBook = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;

  const bookObject = generateBookObject(generateID, textBook, author, year, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

function generateId() {
  return +new Date();
};

function generateBookObject(id, title, author, year, isCompleted){
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
};

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.author;
  
  const textYear = document.createElement('p');
  textYear.innerText = bookObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function() {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    const deleteButton = document.getElementsByClassName('delete-button')[0];
    
    trashButton.addEventListener('click', function() {
      toggleModal();
      deleteButton.addEventListener('click', function() {
        removeBookFromCompleted(bookObject.id);
        modal.classList.remove("show-modal");
      });
    });
    
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function() {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    const deleteButton = document.getElementsByClassName('delete-button')[0];
    
    trashButton.addEventListener('click', function() {
      toggleModal();
      deleteButton.addEventListener('click', function() {
        removeBookFromCompleted(bookObject.id);
        modal.classList.remove("show-modal");
      });
    });

    container.append(checkButton, trashButton);
  }

  return container;
};

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
};

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
};

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
};

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function saveData() {
  if(isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }

  return true;
};

document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const search1 = document.getElementById('search-completed-books');

search1.addEventListener('input', function(event) {
  const searchBox = event.target.value.toLowerCase();
  const books = document.querySelectorAll('#completed-books .inner h3')
  const shelf = Array.from(books);

  shelf.forEach((book) => {
    const eachTitle = book.innerText;
    const hide = book.parentElement;
    const parentElement = hide.parentElement;

    if (eachTitle.toLowerCase().indexOf(searchBox) == 0) {
      book.style.display = 'flex';
      parentElement.style.display = 'flex';
    } else {
      parentElement.style.display = 'none';
    }
  })
});

const search2 = document.getElementById('search-books');

search2.addEventListener('input', function(event) {
  const searchBox = event.target.value.toLowerCase();
  const books = document.querySelectorAll('#books .inner h3')
  const shelf = Array.from(books);

  shelf.forEach((book) => {
    const eachTitle = book.innerText;
    const hide = book.parentElement;
    const parentElement = hide.parentElement;

    if (eachTitle.toLowerCase().indexOf(searchBox) == 0) {
      book.style.display = 'flex';
      parentElement.style.display = 'flex';
    } else {
      parentElement.style.display = 'none';
    }
  })
});

const modal = document.querySelector(".modal");
const cancelButton = document.querySelector(".cancel-button");

function toggleModal() {
  modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

cancelButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
