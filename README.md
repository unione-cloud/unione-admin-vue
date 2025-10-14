# unione-admin-vue

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-green.svg" alt="Vue.js 3.x">
  <img src="https://img.shields.io/badge/Vite-4.x-blue.svg" alt="Vite 4.x">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript 5.x">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="License" />
</div>

## 项目简介

unione-admin-vue 是一个基于 Vue 3、TypeScript 和 Vite 构建的现代化管理系统前端框架，为企业级应用提供高效、灵活、美观的管理界面解决方案。

## 主要特性

- 🚀 **技术栈**：Vue 3 + TypeScript + Vite + Vuex + Vue Router
- 🎨 **UI 设计**：响应式布局，优雅的视觉体验
- 🔒 **权限管理**：完善的权限控制体系
- 📊 **数据可视化**：集成多种图表库
- 🔧 **组件化**：丰富的可复用组件
- 🛠️ **开发体验**：完整的开发工具链，支持热重载、TypeScript 类型检查等

## 技术栈

| 技术/框架    | 版本   | 用途        | 文档                                                     |
| ------------ | ------ | ----------- | -------------------------------------------------------- |
| Vue.js       | 3.x    | 前端框架    | [Vue.js 文档](https://vuejs.org/guide/introduction.html) |
| TypeScript   | 5.x    | 类型系统    | [TypeScript 文档](https://www.typescriptlang.org/docs/)  |
| Vite         | 4.x    | 构建工具    | [Vite 文档](https://vitejs.dev/guide/)                   |
| Vuex         | 4.x    | 状态管理    | [Vuex 文档](https://vuex.vuejs.org/)                     |
| Vue Router   | 4.x    | 路由管理    | [Vue Router 文档](https://router.vuejs.org/)             |
| Element Plus | 2.x    | UI 组件库   | [Element Plus 文档](https://element-plus.org/)           |
| Axios        | 1.x    | HTTP 客户端 | [Axios 文档](https://axios-http.com/docs/intro)          |
| ESLint       | 8.x    | 代码检查    | [ESLint 文档](https://eslint.org/docs/latest/)           |
| Vitest       | 0.33.x | 单元测试    | [Vitest 文档](https://vitest.dev/)                       |
| Cypress      | 12.x   | 端到端测试  | [Cypress 文档](https://docs.cypress.io/)                 |

## 项目结构

```
unione-admin-vue/
├── public/           # 静态资源文件
├── src/
│   ├── api/          # API 接口定义
│   ├── assets/       # 静态资源（图片、样式等）
│   ├── components/   # 公共组件
│   ├── constant/     # 常量定义
│   ├── hooks/        # 自定义 hooks
│   ├── layouts/      # 布局组件
│   ├── router/       # 路由配置
│   ├── store/        # Vuex 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   ├── main.ts       # 入口文件
│   └── env.d.ts      # TypeScript 类型定义
├── .gitignore        # Git 忽略文件
├── index.html        # HTML 入口文件
├── package.json      # 项目依赖配置
├── tsconfig.json     # TypeScript 配置
├── tsconfig.app.json # TypeScript 应用配置
├── tsconfig.config.json # TypeScript 配置文件配置
├── tsconfig.vite-config.json # TypeScript Vite 配置
├── tsconfig.vitest.json # TypeScript Vitest 配置
└── vite.config.ts    # Vite 配置
```

## 功能模块

- **统一门户**：
  - **用户登录**：用户账号登录，支持多因素认证。
  - **个人中心**：用户个人信息、密码修改等功能。
  - **样式设置**：用户个人设置，如语言、主题等。
  - **导航菜单**：应用菜单导航。
  - **系统集成**：系统页面集成
- **系统管理**：
  - **基础管理**：应用管理，菜单管理，按钮管理，配置管理，字典管理
  - **组织管理**：机构管理，用户管理，角色管理，岗位管理，分组管理
  - **权限管理**：用户权限，角色权限，资源权限
  - **租户管理**：多租户管理
  - **运维管理**：操作日志、访问统计
- **统一消息**：
  - **消息类型**：消息类型管理
  - **消息模板**：消息模板管理
  - **消息发送**：消息发送功能
  - **我的消息**：用户接收消息功能

## 推荐 IDE 设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用 Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

## 项目设置

```sh
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行单元测试
npm run test:unit

# 运行端到端测试（开发模式）
npm run test:e2e:dev

# 运行端到端测试（生产模式）
npm run build
npm run test:e2e

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 配置说明

### 环境变量配置

项目支持多种环境配置，在 `.env`、`.env.development` 和 `.env.production` 文件中设置环境变量。

主要配置项：

- `VITE_APP_TITLE`: 应用标题
- `VITE_APP_API_BASE_URL`: API 基础 URL

### Vite 配置

参考 [Vite 配置参考](https://vitejs.dev/config/) 了解更多配置选项。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循项目的 ESLint 规则
- 为新增功能编写测试
- 保持代码简洁、可维护

## 许可证

本项目采用 Apache License 2.0 许可证开源，详情请查看 [LICENSE](LICENSE) 文件。

## 联系方式

- **项目地址github**：https://github.com/unione-cloud/unione-admin-vue
- **项目地址gitee**：https://gitee.com/unione-cloud/unione-admin-vue
- **GitHub Issues**: https://github.com/unione-cloud/unione-admin-vue/issues
- **Gitee Issues**: https://gitee.com/unione-cloud/unione-admin-vue/issues
- **邮箱**：邮箱: unione-cloud@163.com
- **微信号**：wx192637274
  加微信：wx192637274进群，与其他开发者交流、分享经验、解决问题。
- **QQ群**：192637274
  加入QQ群，与其他开发者交流、分享经验、解决问题。
  ![QQ群](./doc/img/qq.png)

## 配套后端项目

- **项目地址github**：https://github.com/unione-cloud/unione
- **项目地址gitee**：https://gitee.com/unione-cloud/unione

---

<div align="center">
  <p>Made with ❤️ by unione-cloud team</p>
</div>
