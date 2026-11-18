# 待办清单 · Todo List

《互联网软件开发技术与实践》第 1 课作业。初版用一轮对话生成，这一版按规约重写：
**先写清什么算做对，再让代码去满足它。**

在线地址：https://yyhg707.github.io/todo-list/

## 这个项目回答什么

初版能打开，但说不清「做对了没有」：空输入会不会建出空条目、刷新后数据在不在、
本地数据损坏会不会白屏。这一版把这些写成了可验收条款（见 `openspec/changes/add-todo-list/specs/todo-list/spec.md`），
并用测试逐条覆盖。

## 目录结构

```
todo-list/
├── index.html                                  页面结构（语义化标签 + CSP）
├── styles.css                                  样式（含 44px 触控与 reduced-motion）
├── src/
│   ├── todos.js                                纯逻辑：增删改查、筛选、统计、存储解析
│   └── app.js                                  渲染与事件绑定
├── tests/
│   └── todos.test.js                           12 组单元测试（node:test）
├── openspec/
│   ├── config.yaml
│   └── changes/add-todo-list/
│       ├── proposal.md                         Why / What Changes / Non-goals
│       ├── design.md                           四个关键决策与取舍
│       ├── tasks.md                            任务与 verify
│       └── specs/todo-list/spec.md             可验收规约（7 条要求、13 个场景）
├── .github/workflows/ci.yml                    推送时跑测试
├── package.json
└── LICENSE
```

## 运行

无需安装依赖，直接打开 `index.html` 即可。需要本地服务器时：

```bash
npx serve .
```

## 测试

```bash
npm test
```

覆盖：正常新增、空与超长输入、不修改入参、切换完成、删除、编辑（含空值）、
清除已完成、筛选与统计、序列化往返、损坏数据回退、非法条目丢弃、文本归一化。

## 相比初版改了什么

| 方面 | 初版 | 现在 |
| --- | --- | --- |
| 结构 | 426 行单文件 | 页面 / 样式 / 逻辑 / 渲染 四层分离 |
| 规约 | 无 | 7 条要求、13 个场景，逐条可验收 |
| 测试 | 无 | 12 组单元测试，`npm test` 一键执行 |
| 数据容错 | `JSON.parse` 裸调用，损坏即白屏 | 结构校验、去重、坏数据回退空列表并提示 |
| 安全 | `innerHTML` + 手写转义 | DOM API + `textContent`，另加 CSP |
| 可访问性 | 仅鼠标 | 键盘可完成全部操作，`aria-live` 播报状态 |
| 交付 | 无法访问 | GitHub Pages + CI |

## 边界

纯前端，没有账号、没有后端、没有网络请求，数据只在本机浏览器。
AI 能力（大模型、知识库、MCP）不在本项目范围，见协作项目
[Jiaoyyy/campus-repair](https://github.com/Jiaoyyy/campus-repair)。

## License

MIT
