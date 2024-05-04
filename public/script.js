const newBookForm = document.querySelector('#new-book');
const bookList = document.querySelector('#book-list');
const bookDetail = document.querySelector('#detail');
const addCommentBtn = document.querySelector('#add-comment');
const deleteBookBtn = document.querySelector('#delete-book');
const deleteAllBtn = document.querySelector('#delete-all');

let books;

function createBook({ title, commentcount }) {
  const li = document.createElement('li');
  li.dataset.title = title;
  li.innerHTML = `${title} - <span>${commentcount} ${commentcount === 1 ? 'comment' : 'comments'}</span>`;

  li.addEventListener('click', () => {
    const book = books.find(book => book.title === title);

    displayBookDetail(book);
  });

  return li;
}

function createComment(comment) {
  const li = document.createElement('li');
  li.textContent = comment;

  return li;
}

function displayBookDetail({ _id, title, comments }) {
  while (bookDetail.firstChild) {
    bookDetail.removeChild(bookDetail.firstChild);
  }

  const p = document.createElement('p');
  p.innerHTML = `<span class="title">${title}</span> (id: ${_id})`;

  const ol = document.createElement('ol');
  ol.append(...comments.map(createComment));

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.name = 'comment';
  textInput.placeholder = 'New Comment';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';

  const addCommentBtn = document.createElement('button');
  addCommentBtn.id = 'add-comment';
  addCommentBtn.textContent = 'Add Comment';

  addCommentBtn.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('comment', textInput.value);

    fetch(`/api/books/${_id}`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        ol.append(createComment(data.comments[data.comments.length - 1]));
        textInput.value = '';

        const book = books.find(book => book.title === title);
        book.commentcount++;
        book.comments.push(data.comments[data.comments.length - 1]);

        const li = bookList.querySelector(`[data-title="${title}"]`);

        li.replaceWith(createBook(book));
      });
  });

  const deleteBookBtn = document.createElement('button');
  deleteBookBtn.id = 'delete-book';
  deleteBookBtn.textContent = 'Delete Book';

  deleteBookBtn.addEventListener('click', () => {
    fetch(`/api/books/${_id}`, {
      method: 'DELETE'
    })
      .then(() => window.location.reload());
  });

  btnGroup.append(addCommentBtn, deleteBookBtn);

  bookDetail.append(
    p,
    ol,
    textInput,
    btnGroup
  );
}

fetch('/api/books')
  .then(res => res.json())
  .then(data => {
    books = data;
    bookList.append(...books.map(createBook));
  });

newBookForm.addEventListener('submit', e => {
  e.preventDefault();

  fetch('/api/books', {
    method: 'POST',
    body: new FormData(newBookForm)
  })
    .then(() => window.location.reload());
});

deleteAllBtn.addEventListener('click', () => {
  fetch('/api/books', {
    method: 'DELETE'
  })
    .then(() => window.location.reload());
});

