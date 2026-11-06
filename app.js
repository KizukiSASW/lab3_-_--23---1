'use strict';

/* ---------- Константы ---------- */
const GET_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

/* ---------- DOM-элементы ---------- */
const loadBtn = document.getElementById('loadBtn');
const postsList = document.getElementById('postsList');
const messageArea = document.getElementById('messageArea');
const postForm = document.getElementById('postForm');
const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const createBtn = document.getElementById('createBtn');

/* ---------- Вспомогательные функции ---------- */

function showMessage(text, type = 'info') {//Эта функция отвечает за вывод сообщений (об успехе, ошибке или загрузке).
  messageArea.textContent = text;
  messageArea.className = `message-area ${type}`;
}

function createPostCard(title, body, id = null) {//создание публикации
  const card = document.createElement('article');
  card.className = 'post-card';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = body;

  card.appendChild(heading);
  card.appendChild(paragraph);

  if (id !== null) {
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    meta.textContent = `ID: ${id}`;
    card.appendChild(meta);
  }

  return card;
}

/* ---------- GET: загрузка публикаций ---------- */

async function loadPosts() {//для ожидания ответов от сети.
  loadBtn.disabled = true;
  postsList.replaceChildren();
  showMessage('Загрузка публикаций…', 'info');

  try {
    
    const response = await fetch(GET_URL, {
      signal: AbortSignal.timeout(8000)// ожидание 8 сек
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => {
      fragment.appendChild(createPostCard(post.title, post.body));
    });
    postsList.appendChild(fragment);

    showMessage(`Загружено публикаций: ${posts.length}`, 'success');
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      showMessage('Ошибка: Сервер не отвечает (превышено время ожидания). Проверьте интернет или отключите блокировщик рекламы.', 'error');
    } else {
      showMessage(`Не удалось загрузить публикации: ${error.message}`, 'error');
    }
  } finally {
    loadBtn.disabled = false;
  }
}

/* ---------- POST: создание публикации ---------- */

async function createPost(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showMessage('Заполните оба поля: заголовок и текст (пробелы не считаются).', 'error');
    return;
  }

  createBtn.disabled = true;
  showMessage('Отправка публикации…', 'info');

  try {
    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, userId: 1 }),
      // Даем серверу 8 секунд на ответ
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    postsList.prepend(createPostCard(data.title, data.body, data.id));

    showMessage(
      `Публикация создана успешно. Заголовок: "${data.title}", ID: ${data.id}`,
      'success'
    );

    postForm.reset();
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      showMessage('Ошибка отправки: Сервер не отвечает (превышено время ожидания). Попробуйте еще раз.', 'error');
    } else {
      showMessage(`Не удалось создать публикацию: ${error.message}`, 'error');
    }
  } finally {
    // В ЛЮБОМ СЛУЧАЕ возвращаем кнопку в активное состояние
    createBtn.disabled = false;
  }
}

/* ---------- Обработчики событий ---------- */

loadBtn.addEventListener('click', loadPosts);
postForm.addEventListener('submit', createPost);