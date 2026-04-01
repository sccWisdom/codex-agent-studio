# Architecture (MVP)

## 分层

1. 前端展示层：`app/`, `components/`, `features/`
2. 应用服务层：后续在 `lib/` 中按域扩展
3. Agent 执行层：后续落地在 `lib/agent/`
4. 数据持久层：`prisma/`, `lib/db/`

## 目录约定

- `app/`: 路由与页面
- `components/`: 通用 UI 与布局
- `features/`: 领域页面模块
- `lib/`: 配置、数据库、工具、Agent、校验等
- `prisma/`: 数据模型与迁移
- `tests/`: 自动化测试

## 初始化阶段边界

- 只做可运行骨架与基础目录分层
- 不提前实现业务逻辑闭环
- 所有后续功能按 `SPEC.md` 里程碑推进

