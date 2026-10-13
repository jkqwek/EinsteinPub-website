# Einstein Pub — frontend

Website of the Einstein pub: React 19 + Vite 8 + Tailwind CSS v4 + TypeScript, package manager pnpm.
The repository root holds `frontend/` (this app) and `backend/` (Django + DRF API and the Django admin, see `backend/AGENTS.md`). The menu, events, gallery and booking form work through the API; content is edited in the Django admin at `/admin/`.

The site is in Russian (`<html lang="ru">`); write new UI text in Russian.

## Commands

Run from `frontend/`:

- `pnpm install` - install dependencies (`pnpm-lock.yaml` is committed)
- `pnpm dev` - dev server on http://localhost:8443; `/api`, `/admin`, `/static` and `/media` are proxied to Django on :8000, so run the backend too (see `backend/AGENTS.md`)
- `pnpm build` - production build into `dist/`
- `pnpm preview` - serve the built `dist/`
- `pnpm format` - format with oxfmt

## Project Structure

- `index.html` - HTML shell: language, page title, meta description; loads `src/main.tsx`
- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` - router, navbar, footer, Home and Menu pages, "coming soon" and 404 placeholders
- `src/pages/` - Booking, Events (plus the event card used on Home), Gallery, Contacts and Privacy (privacy policy template, linked from the booking form) pages
- `src/api.ts` - API types, `useApi` hook for GET endpoints, `createBooking`, price and event date formatting
- `src/components/SocialIcons.tsx` - VK and Telegram logos
- `src/siteInfo.ts` - address, phone, opening hours, map and social links shared by the footer and the Contacts page
- `src/sections.ts` - flags that publish or hide sections; a hidden section keeps its nav link but renders the placeholder
- `src/index.css` - Tailwind import, theme colors and fonts, custom utilities and keyframes
- `vite.config.ts` - React and Tailwind plugins, `@` alias for `src`, dev server port, proxy to Django

## Dependencies

- Runtime: React 19, React Router 7, Framer Motion, lucide-react, clsx + tailwind-merge
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5, `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

Tailwind CSS v4 is wired through `@tailwindcss/vite`; there is no Tailwind or PostCSS config file. Theme tokens (`forest`, `gold`, `offwhite` colors, plus the `burgundy` #611820 accent for trims and badges, `Manrope` and `Unbounded` fonts) live in `@theme` in `src/index.css`. Declare reusable classes with `@utility` rather than plain CSS classes, so per-element utilities can still override them. Keep CSS `@import` statements first in `src/index.css`.
