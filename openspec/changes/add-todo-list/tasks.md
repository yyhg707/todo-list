# Tasks

复选框只标记已实现并验证的项。验证方式见每项的 `verify:`。

## 1. 结构与规约

- [x] 1.1 按 `index.html` / `styles.css` / `src/todos.js` / `src/app.js` 拆分
  - verify: 页面可打开，脚本无控制台错误
- [x] 1.2 补齐 proposal、design、spec 与 tasks
  - verify: 每条 Requirement 都有对应测试或手工验收记录

## 2. 逻辑与测试

- [x] 2.1 实现增删改查、筛选、统计与序列化纯函数
  - verify: `npm test` 通过
- [x] 2.2 覆盖空输入、长度上限、未知 id、去重与损坏数据
  - verify: 空文本不产生条目；损坏的存储回退空列表且不抛异常

## 3. 界面与可访问性

- [x] 3.1 渲染改用 DOM API，用户文本不进入 HTML
  - verify: 输入 `<img src=x onerror=alert(1)>` 后页面按文本显示，不执行脚本
- [x] 3.2 键盘操作：回车添加、双击或「编辑」进入编辑、回车保存、Esc 取消
  - verify: 不使用鼠标可完成添加、完成与删除
- [x] 3.3 状态变化通过 `aria-live` 播报，筛选按钮带 `aria-pressed`
  - verify: 读屏或检查元素可看到状态文本更新
- [x] 3.4 触控目标不小于 44px，390px 宽度无横向滚动
  - verify: 视口 390×844 下按钮高度均 ≥44，`scrollWidth` 等于视口宽度

## 4. 安全

- [x] 4.1 增加 CSP，禁止内联脚本、外部连接与表单外发
  - verify: 控制台无 CSP 违规，页面功能正常
- [x] 4.2 存储读取做结构校验，失败时降级而不是白屏
  - verify: 写入非法 JSON 后刷新，页面显示空态与提示

## 5. 交付

- [x] 5.1 增加 `package.json` 与 `npm test`
  - verify: 新环境执行 `npm test` 通过，无需安装依赖
- [x] 5.2 增加 CI，推送与 PR 时跑测试
  - verify: 工作流运行记录为通过
- [x] 5.3 开启 GitHub Pages 并写入 README
  - verify: https://yyhg707.github.io/todo-list/ 返回 200，页面可完成新增、完成、刷新恢复
