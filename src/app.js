import {
  STORAGE_KEY, addTodo, toggleTodo, removeTodo, updateTodo, clearCompleted,
  filterTodos, stats, parseStored, serialize, MAX_TEXT,
} from './todos.js';

const els = {
  form: document.querySelector('#new-form'),
  input: document.querySelector('#new-text'),
  list: document.querySelector('#todo-list'),
  empty: document.querySelector('#empty'),
  total: document.querySelector('#count-total'),
  active: document.querySelector('#count-active'),
  done: document.querySelector('#count-done'),
  status: document.querySelector('#status'),
  clear: document.querySelector('#clear-completed'),
  filters: Array.from(document.querySelectorAll('[data-filter]')),
};

let list = [];
let filter = 'all';
let storageFailed = false;
let editingId = null;

function load() {
  try {
    list = parseStored(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    storageFailed = true;
    list = [];
  }
}

function save() {
  if (storageFailed) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(list));
  } catch {
    storageFailed = true;
    announce('本地存储不可用，本次修改不会被保存。');
  }
}

function announce(text) {
  els.status.textContent = '';
  window.setTimeout(() => { els.status.textContent = text; }, 30);
}

function setFilter(next) {
  filter = next;
  els.filters.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter));
  });
  render();
}

function startEdit(id) {
  editingId = id;
  render();
  const input = els.list.querySelector(`[data-edit="${id}"]`);
  if (input) {
    input.focus();
    input.select();
  }
}

function commitEdit(id, value) {
  const before = list.find((item) => item.id === id);
  list = updateTodo(list, id, value);
  editingId = null;
  save();
  render();
  if (before && before.text !== (list.find((item) => item.id === id) || {}).text) {
    announce('已保存修改。');
  }
}

function cancelEdit() {
  editingId = null;
  render();
}

function buildItem(item) {
  const li = document.createElement('li');
  li.className = item.completed ? 'todo completed' : 'todo';
  li.dataset.id = String(item.id);

  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'toggle';
  check.setAttribute('role', 'checkbox');
  check.setAttribute('aria-checked', String(item.completed));
  check.setAttribute('aria-label', `${item.completed ? '取消完成' : '完成'}：${item.text}`);
  check.addEventListener('click', () => {
    list = toggleTodo(list, item.id);
    save();
    render();
    announce(item.completed ? '已标记为未完成。' : '已完成。');
  });

  const body = document.createElement('div');
  body.className = 'body';

  if (editingId === item.id) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.text;
    input.maxLength = MAX_TEXT;
    input.dataset.edit = String(item.id);
    input.setAttribute('aria-label', '编辑待办内容');
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); commitEdit(item.id, input.value); }
      if (event.key === 'Escape') { event.preventDefault(); cancelEdit(); }
    });
    input.addEventListener('blur', () => { if (editingId === item.id) commitEdit(item.id, input.value); });
    body.appendChild(input);
  } else {
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = item.text;
    text.title = '双击编辑';
    text.addEventListener('dblclick', () => startEdit(item.id));
    body.appendChild(text);

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '';
    body.appendChild(time);
  }

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'ghost';
  edit.textContent = '编辑';
  edit.setAttribute('aria-label', `编辑：${item.text}`);
  edit.addEventListener('click', () => startEdit(item.id));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'ghost danger';
  del.textContent = '删除';
  del.setAttribute('aria-label', `删除：${item.text}`);
  del.addEventListener('click', () => {
    list = removeTodo(list, item.id);
    save();
    render();
    announce('已删除。');
  });

  li.append(check, body, edit, del);
  return li;
}

function render() {
  const counts = stats(list);
  els.total.textContent = String(counts.total);
  els.active.textContent = String(counts.active);
  els.done.textContent = String(counts.completed);
  els.clear.disabled = counts.completed === 0;

  const visible = filterTodos(list, filter);
  els.list.replaceChildren();
  visible.forEach((item) => els.list.appendChild(buildItem(item)));

  els.empty.hidden = visible.length !== 0;
  if (!visible.length) {
    els.empty.textContent = counts.total === 0 ? '还没有待办，先加一条。' : '当前筛选下没有待办。';
  }
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const before = list.length;
  list = addTodo(list, els.input.value);
  if (list.length === before) {
    announce(`请输入 1 到 ${MAX_TEXT} 个字符的待办内容。`);
    els.input.focus();
    return;
  }
  els.input.value = '';
  save();
  render();
  announce('已添加。');
  els.input.focus();
});

els.filters.forEach((btn) => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

els.clear.addEventListener('click', () => {
  const removed = stats(list).completed;
  if (!removed) return;
  list = clearCompleted(list);
  save();
  render();
  announce(`已清除 ${removed} 条已完成。`);
});

// 多个标签页同时打开时，以最后一次写入为准并重新渲染，避免互相覆盖后显示不一致。
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  list = parseStored(event.newValue || '');
  editingId = null;
  render();
  announce('内容已在其他标签页更新。');
});

load();
setFilter('all');
if (storageFailed) announce('本地存储不可用，刷新后不会保留内容。');
