# unione-admin-vue

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-green.svg" alt="Vue.js 3.x">
  <img src="https://img.shields.io/badge/Vite-4.x-blue.svg" alt="Vite 4.x">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript 5.x">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Apache License 2.0">
</div>

## Project Introduction

unione-admin-vue is a modern management system frontend framework built with Vue 3, TypeScript, and Vite, providing efficient, flexible, and beautiful management interface solutions for enterprise-level applications.

## Key Features

- 🚀 **Technology Stack**: Vue 3 + TypeScript + Vite + Vuex + Vue Router
- 🎨 **UI Design**: Responsive layout with elegant visual experience
- 🔒 **Permission Management**: Comprehensive permission control system
- 📊 **Data Visualization**: Integration with multiple chart libraries
- 🔧 **Componentization**: Rich collection of reusable components
- 🛠️ **Development Experience**: Complete development toolchain with hot reloading, TypeScript type checking, etc.

## Functional Modules

- **Unified Portal**:
  - **User Login**: User account login, supporting multi-factor authentication.
  - **Personal Center**: User personal information, password modification, etc.
  - **Style Settings**: User personal settings, such as language, theme, etc.
  - **Navigation Menu**: Application menu navigation.
  - **System Integration**: System page integration
- **System Management**:
  - **Basic Management**: Application management, menu management, button management, configuration management, dictionary management
  - **Organization Management**: Institution management, user management, role management, position management, group management
  - **Permission Management**: User permissions, role permissions, resource permissions
  - **Tenant Management**: Multi-tenant management
  - **Operation and Maintenance Management**: Operation logs, access statistics
- **Unified Messaging**:
  - **Message Types**: Message type management
  - **Message Templates**: Message template management
  - **Message Sending**: Message sending functionality
  - **My Messages**: User received messages functionality

## Technology Stack

| Technology/Framework | Version | Purpose              | Documentation                                                     |
| -------------------- | ------- | -------------------- | ----------------------------------------------------------------- |
| Vue.js               | 3.x     | Frontend Framework   | [Vue.js Documentation](https://vuejs.org/guide/introduction.html) |
| TypeScript           | 5.x     | Type System          | [TypeScript Documentation](https://www.typescriptlang.org/docs/)  |
| Vite                 | 4.x     | Build Tool           | [Vite Documentation](https://vitejs.dev/guide/)                   |
| Vuex                 | 4.x     | State Management     | [Vuex Documentation](https://vuex.vuejs.org/)                     |
| Vue Router           | 4.x     | Routing Management   | [Vue Router Documentation](https://router.vuejs.org/)             |
| Element Plus         | 2.x     | UI Component Library | [Element Plus Documentation](https://element-plus.org/)           |
| Axios                | 1.x     | HTTP Client          | [Axios Documentation](https://axios-http.com/docs/intro)          |
| ESLint               | 8.x     | Code Linting         | [ESLint Documentation](https://eslint.org/docs/latest/)           |
| Vitest               | 0.33.x  | Unit Testing         | [Vitest Documentation](https://vitest.dev/)                       |
| Cypress              | 12.x    | End-to-End Testing   | [Cypress Documentation](https://docs.cypress.io/)                 |

## Project Structure

```
unione-admin-vue/
├── public/           # Static resource files
├── src/
│   ├── api/          # API interface definitions
│   ├── assets/       # Static assets (images, styles, etc.)
│   ├── components/   # Common components
│   ├── constant/     # Constant definitions
│   ├── hooks/        # Custom hooks
│   ├── layouts/      # Layout components
│   ├── router/       # Routing configuration
│   ├── store/        # Vuex state management
│   ├── utils/        # Utility functions
│   ├── views/        # Page components
│   ├── App.vue       # Root component
│   ├── main.ts       # Entry file
│   └── env.d.ts      # TypeScript type definitions
├── .gitignore        # Git ignore file
├── index.html        # HTML entry file
├── package.json      # Project dependencies configuration
├── tsconfig.json     # TypeScript configuration
├── tsconfig.app.json # TypeScript application configuration
├── tsconfig.config.json # TypeScript configuration file configuration
├── tsconfig.vite-config.json # TypeScript Vite configuration
├── tsconfig.vitest.json # TypeScript Vitest configuration
└── vite.config.ts    # Vite configuration
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

## Project Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm run test:unit

# Run end-to-end tests (development mode)
npm run test:e2e:dev

# Run end-to-end tests (production mode)
npm run build
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Configuration

### Environment Variables

The project supports multiple environment configurations. Set environment variables in `.env.dev` and `.env.prod` files.

Main configuration items:

- `VITE_APP_TITLE`: Application title
- `VITE_APP_API_BASE_URL`: API base URL

### Vite Configuration

Refer to the [Vite Configuration Reference](https://vitejs.dev/config/) for more configuration options.

## Contribution Guide

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow the project's ESLint rules
- Write tests for new features
- Keep code concise and maintainable

## License

This project is open-sourced under the Apache License 2.0. For more details, please refer to the [LICENSE](LICENSE) file.

## Contact

- **Project Address (GitHub)**: https://github.com/unione-cloud/unione
- **Project Address (Gitee)**: https://gitee.com/unione-cloud/unione
- **GitHub Issues**: [Submit Issues](https://github.com/unione-cloud/unione/issues)
- **Gitee Issues**: [Submit Issues](https://gitee.com/unione-cloud/unione/issues)
- **Email**: unione-cloud@163.com
- **WeChat ID**: wx192637274
  Add WeChat ID: wx192637274 to join the group, communicate with other developers, share experiences, and solve problems.
- **QQ Group**: 192637274
  Join the QQ group to communicate with other developers, share experiences, and solve problems.
  ![QQ Group](./doc/img/qq.png)

## Backend Project

- **GitHub Repository**: https://github.com/unione-cloud/unione
- **Gitee Repository**: https://gitee.com/unione-cloud/unione

---

<div align="center">
  <p>Made with ❤️ by unione-cloud team</p>
</div>
