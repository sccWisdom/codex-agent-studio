# Codex Agent Studio

基于 `SPEC.md` 的 Web 端 AI Agent 工作台（MVP 路线）。

当前进度：`Milestone 1 / 项目初始化` 已完成。

## 技术栈

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui（基础配置）
- Prisma + SQLite（本地开发）

## 快速启动

1. 安装依赖

```bash
npm install
```

2. 准备环境变量

```bash
copy .env.example .env
```

3. 初始化数据库（生成 Prisma Client + 本地 SQLite）

```bash
npx prisma migrate dev --name init
```

4. 启动开发服务

```bash
npm run dev
```

打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

## 可用页面（初始化阶段）

- `/` 首页
- `/chat` 聊天主入口（占位）
- `/chat/[sessionId]` 会话详情（占位）
- `/knowledge` 知识页（占位）
- `/runs` 运行记录页（占位）
- `/settings` 设置页（占位）

## 数据模型（MVP 基础）

已在 Prisma 中建模：

- `Session`
- `Message`
- `Run`
- `ToolCall`
- `KnowledgeSource`
- `AppSetting`

## 校验命令

```bash
npm run lint
npm run build
npm run test
```

## 下一里程碑

`Milestone 2`：聊天闭环（会话创建、消息发送、Agent 调用、结果回显、历史持久化）。

