# Portfolio CMS redesign

The CMS admin now uses the same design as the new portfolio: warm porcelain paper, ink text,
marigold highlights and dusk blue for focus and links. Fonts are Bricolage Grotesque (headings)
and Hanken Grotesk (text), loaded from Google Fonts.

## Install

1. Extract this zip into the root of your `websmith-frontend` project, so that `src/` and
   `index.html` merge with the existing ones. Say yes to "replace files" when asked.
2. No new packages are needed. Run `npm run dev` as usual.
3. Optional: set `VITE_SITE_URL` in `.env` if your portfolio address changes. It defaults to
   `https://sohamkoli.netlify.app` and is used by the "View site" links.

## What is in the zip

New files
- `src/config/site.js` portfolio address
- `src/utils/dashboardData.js` helpers for the dashboard chart and activity list

Replaced files
- `index.html` new title, theme colour, and `noindex` so search engines skip the admin
- `src/index.css` the whole design system (colours, buttons, cards, forms, tables, modal, editor)
- `src/App.css` small leftover
- `src/components/layout/Layout.jsx`, `Sidebar.jsx`, `Header.jsx`
- `src/components/ui/Button.jsx`, `Card.jsx`, `Input.jsx`, `Modal.jsx`
- `src/components/shared/LoadingSpinner.jsx`, `ErrorMessage.jsx`, `SuccessMessage.jsx`, `Messages.jsx`
- `src/pages/Login.jsx`, `src/pages/Dashboard.jsx`

## How the other pages get the new look without being edited

Your content pages (About, Skills, Projects, Blogs, Certificates, Achievements, Experience,
Testimonials, Services, Messages, Analytics, Media) are written with Tailwind colour classes such as
`bg-gray-50`, `text-gray-900`, `bg-blue-100` and `text-red-600`. `src/index.css` redefines those
colour scales (grey becomes warm grey, blue becomes dusk, yellow becomes marigold, and so on), so every
page changes at once. The old dark overrides are gone.

## Behaviour changes worth knowing

- Dashboard: the made-up trend percentages (+12%, -3%) are removed; every number now comes from your data.
  It makes one set of requests instead of two.
- Header: the search box and bell did nothing before. The bell now opens Messages and shows the unread count.
  A "View site" link opens the portfolio.
- Login: the "Forgot password" link and "Remember me" box did nothing, so they are removed.
- Modals: Esc closes them, focus is kept inside while typing, and they are announced properly to screen readers.
- Sidebar: grouped into Content, Library, Inbox and Insights, with the current page marked.
