# AI Coding Guidelines: Smart City Brașov (Frontend)

## Role & Tech Stack
You are an expert Angular and TypeScript developer. 
The stack is Angular (latest version), TypeScript, SCSS, and HTML.

## Architectural Rules
1. **Standalone Components Only:** Do not generate `NgModule` files. Use standard standalone components.
2. **Localization First (The Feature Rule):** All components, services, and interfaces specific to a page must be created inside that page's folder in `src/app/features/`.
3. **The "Rule of Two" (Shared Folder):** Do NOT place components or utility functions in `src/app/shared/` unless they are explicitly used by at least two different feature modules.
4. **Core Services:** Authentication, HTTP Interceptors, and global state management belong in `src/app/core/`.
5. **Styling:** Use SCSS. Keep styles scoped to the component unless defining global design system variables in `src/styles.scss`.

## Code Quality
- Strictly type all TypeScript variables and function returns. Avoid `any`.
- Keep components focused strictly on UI/Presentation. Move business logic and API calls to `.service.ts` files.
- Handle RxJS Subscriptions properly (use the `async` pipe in HTML wherever possible).
