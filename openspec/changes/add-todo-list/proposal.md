# Proposal: 待办清单工程化重写

## Why

初版用一轮对话生成，所有代码挤在一个 `index.html` 里（426 行），没有规约、没有测试、没有部署。
它能打开，但说不清「什么算做对了」：空输入会不会建出空条目、刷新后数据还在不在、
localStorage 损坏会不会白屏——这些都没有约定，换一个人接手也无法判断是否达标。

本 change 把行为写成可验收规约，并给出对应的实现与测试，让它从「能跑」变成「能验收」。

## What Changes

- 补齐可验收规约：空输入、长度上限、统计口径、筛选、持久化与损坏数据的处理。
- 拆分结构：`index.html` / `styles.css` / `src/todos.js`（纯逻辑）/ `src/app.js`（DOM）。
- 新增单元测试，覆盖新增、切换、删除、编辑、筛选、统计与存储容错。
- 安全与可访问性：不拼接用户文本到 HTML、存储解析失败不白屏、键盘可完成主要操作。
- 交付：GitHub Pages 可访问，GitHub Actions 在每次推送时跑测试。

## Capabilities

### New Capabilities
- `todo-list`：待办条目的增删改查、筛选、统计与本地持久化

### Modified Capabilities
无。

## Impact

- **前端**：单文件拆为 4 个文件；交互补充键盘与读屏支持。
- **数据**：localStorage 键改为 `todo-list/v1`，读取时校验结构与去重。
- **依赖**：零运行时依赖；测试使用 Node 内置 `node:test`。
- **交付**：新增 `package.json`、CI 工作流与 License。

## Non-goals

- 不做账号登录与多设备同步。
- 不做提醒、推送、日历集成。
- 不做附件、富文本与分类标签。
- 不引入前端框架与打包工具，保持原生实现。
