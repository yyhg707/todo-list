/**
 * 待办清单的纯逻辑：不碰 DOM，便于单元测试。
 * 数据形状：{ id: number, text: string, completed: boolean, createdAt: string }
 */

export const STORAGE_KEY = 'todo-list/v1';
export const MAX_TEXT = 200;

/** 去首尾空白；连续空白压成一个空格。 */
export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/** 文本是否可用：非空且不超过上限。 */
export function isValidText(value) {
  const text = normalizeText(value);
  return text.length > 0 && text.length <= MAX_TEXT;
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

/**
 * 新增一条。空文本或超长直接返回原列表，保证「无效输入不产生记录」。
 * 返回新数组，不修改入参。
 */
export function addTodo(list, text, now = new Date()) {
  const value = normalizeText(text);
  if (!isValidText(value)) return list;
  return list.concat({
    id: nextId(list),
    text: value,
    completed: false,
    createdAt: now.toISOString(),
  });
}

/** 切换完成状态；不存在的 id 原样返回。 */
export function toggleTodo(list, id) {
  let changed = false;
  const next = list.map((item) => {
    if (item.id !== id) return item;
    changed = true;
    return { ...item, completed: !item.completed };
  });
  return changed ? next : list;
}

/** 删除一条。 */
export function removeTodo(list, id) {
  const next = list.filter((item) => item.id !== id);
  return next.length === list.length ? list : next;
}

/** 编辑文本；空文本视为无效，保留原内容。 */
export function updateTodo(list, id, text) {
  const value = normalizeText(text);
  if (!isValidText(value)) return list;
  let changed = false;
  const next = list.map((item) => {
    if (item.id !== id || item.text === value) return item;
    changed = true;
    return { ...item, text: value };
  });
  return changed ? next : list;
}

/** 清除已完成，返回剩余项。 */
export function clearCompleted(list) {
  return list.filter((item) => !item.completed);
}

export const FILTERS = ['all', 'active', 'completed'];

/** 按筛选条件返回子集；未知条件按「全部」处理。 */
export function filterTodos(list, filter) {
  if (filter === 'active') return list.filter((item) => !item.completed);
  if (filter === 'completed') return list.filter((item) => item.completed);
  return list;
}

/** 统计总数、未完成、已完成。 */
export function stats(list) {
  const completed = list.filter((item) => item.completed).length;
  return { total: list.length, active: list.length - completed, completed };
}

/**
 * 解析本地存储。任何损坏、旧格式或非数组内容都回退为空列表，
 * 不抛异常，避免整页白屏。
 */
export function parseStored(raw) {
  if (typeof raw !== 'string' || raw === '') return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  const list = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const id = Number(item.id);
    const text = normalizeText(item.text);
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
    if (!isValidText(text)) continue;
    seen.add(id);
    list.push({
      id,
      text,
      completed: item.completed === true,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    });
  }
  return list;
}

/** 序列化，供写入本地存储。 */
export function serialize(list) {
  return JSON.stringify(list);
}
