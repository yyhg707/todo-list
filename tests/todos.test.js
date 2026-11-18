import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addTodo, toggleTodo, removeTodo, updateTodo, clearCompleted,
  filterTodos, stats, parseStored, serialize, isValidText, normalizeText, MAX_TEXT,
} from '../src/todos.js';

const fixed = new Date('2026-11-18T10:00:00.000Z');

test('新增：去空白、生成递增 id、默认未完成', () => {
  let list = addTodo([], '  买   电池  ', fixed);
  assert.equal(list.length, 1);
  assert.equal(list[0].text, '买 电池');
  assert.equal(list[0].completed, false);
  assert.equal(list[0].id, 1);
  list = addTodo(list, '交作业', fixed);
  assert.equal(list[1].id, 2);
});

test('新增：空文本、纯空格、超长都不产生记录', () => {
  const base = addTodo([], '已有', fixed);
  assert.equal(addTodo(base, '', fixed), base);
  assert.equal(addTodo(base, '   \n\t ', fixed), base);
  assert.equal(addTodo(base, 'x'.repeat(MAX_TEXT + 1), fixed), base);
  assert.equal(addTodo(base, 'x'.repeat(MAX_TEXT), fixed).length, 2);
});

test('新增：不修改原数组', () => {
  const base = [];
  const next = addTodo(base, '一条', fixed);
  assert.equal(base.length, 0);
  assert.equal(next.length, 1);
});

test('切换完成：只影响目标项，未知 id 原样返回', () => {
  const list = addTodo(addTodo([], 'A', fixed), 'B', fixed);
  const toggled = toggleTodo(list, 1);
  assert.equal(toggled[0].completed, true);
  assert.equal(toggled[1].completed, false);
  assert.equal(toggleTodo(list, 999), list);
});

test('删除：命中才返回新数组', () => {
  const list = addTodo(addTodo([], 'A', fixed), 'B', fixed);
  const removed = removeTodo(list, 1);
  assert.deepEqual(removed.map((i) => i.id), [2]);
  assert.equal(removeTodo(list, 999), list);
});

test('编辑：空白不覆盖原值，相同内容不产生新数组', () => {
  const list = addTodo([], '原来的', fixed);
  assert.equal(updateTodo(list, 1, '  '), list);
  assert.equal(updateTodo(list, 1, '原来的'), list);
  assert.equal(updateTodo(list, 1, '改过的')[0].text, '改过的');
});

test('清除已完成', () => {
  let list = addTodo(addTodo([], 'A', fixed), 'B', fixed);
  list = toggleTodo(list, 1);
  assert.deepEqual(clearCompleted(list).map((i) => i.text), ['B']);
});

test('筛选与统计', () => {
  let list = addTodo(addTodo([], 'A', fixed), 'B', fixed);
  list = toggleTodo(list, 1);
  assert.deepEqual(filterTodos(list, 'active').map((i) => i.text), ['B']);
  assert.deepEqual(filterTodos(list, 'completed').map((i) => i.text), ['A']);
  assert.equal(filterTodos(list, 'all').length, 2);
  assert.equal(filterTodos(list, 'unknown').length, 2);
  assert.deepEqual(stats(list), { total: 2, active: 1, completed: 1 });
});

test('存储：序列化后可还原', () => {
  const list = addTodo([], '持久化', fixed);
  assert.deepEqual(parseStored(serialize(list)), list);
});

test('存储：损坏内容回退为空列表，不抛异常', () => {
  for (const raw of ['', '{', 'null', '"text"', '{"a":1}', '[1,2,3]', 'not json']) {
    assert.deepEqual(parseStored(raw), [], `raw=${raw}`);
  }
});

test('存储：非法条目被丢弃并去重', () => {
  const raw = JSON.stringify([
    { id: 1, text: '正常', completed: false },
    { id: 1, text: '重复 id', completed: true },
    { id: 0, text: '非法 id' },
    { id: 2, text: '   ' },
    { id: 3, text: '超长 ' + 'x'.repeat(MAX_TEXT) },
    null,
  ]);
  const list = parseStored(raw);
  assert.deepEqual(list.map((i) => i.id), [1]);
  assert.equal(list[0].text, '正常');
});

test('文本边界与归一化', () => {
  assert.equal(normalizeText('  a \n b  '), 'a b');
  assert.equal(isValidText('   '), false);
  assert.equal(isValidText('x'.repeat(MAX_TEXT)), true);
  assert.equal(isValidText('x'.repeat(MAX_TEXT + 1)), false);
});
