# Installation & Setup Guide

This document explains how to install the required tools and run the **WeatherCast** Vue 3 application locally.

---

## Prerequisites

| Tool | Minimum Version | Download |
|------|-----------------|---------|
| **Node.js** | 20.x LTS or 22.x+ | https://nodejs.org/ |
| **npm** | 10.x (ships with Node) | bundled with Node.js |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) or
> [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node versions easily.

---

## 1 – Clone the Repository

```bash
git clone https://github.com/Kilam3811/WeatherForcastDemoApp.git
cd WeatherForcastDemoApp
```

---

## 2 – Install Frontend Dependencies

```bash
cd frontend
npm install
```

`npm install` reads `package.json` and downloads all required packages into
the local `node_modules/` folder.  The main dependencies are:

| Package | Purpose |
|---------|---------|
| `vue` 3.x | Core UI framework |
| `vue-router` 5.x | Client-side routing |

Development/build tooling:

| Package | Purpose |
|---------|---------|
| `vite` | Ultra-fast dev server & bundler |
| `@vitejs/plugin-vue` | Vite integration for `.vue` files |
| `typescript` | Static typing |
| `vue-tsc` | Vue-aware TypeScript type checker |
| `npm-run-all2` | Run npm scripts in parallel |

---

## 3 – Start the Development Server

```bash
npm run dev
```

Vite will print the local URL (typically **http://localhost:5173**).  
Open it in your browser – the app hot-reloads automatically on every file save.

---

## 4 – Build for Production

```bash
npm run build
```

Compiled, minified files are written to `frontend/dist/`.  
To preview the production build locally:

```bash
npm run preview
```

---

## 5 – Run the TypeScript Type-Check (optional)

```bash
npm run type-check
```

This runs `vue-tsc` without emitting files – useful for CI or pre-commit hooks.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `node: command not found` | Install Node.js from https://nodejs.org/ |
| `npm install` fails with `ERESOLVE` | Delete `node_modules/` and `package-lock.json`, then retry |
| Port 5173 already in use | Run `npm run dev -- --port 5174` to use a different port |
| Blank page after `npm run build` | Check that `base` in `vite.config.ts` matches your deployment sub-path |

---

## Project Structure (quick reference)

```
frontend/
├── public/              # Static assets copied as-is
├── src/
│   ├── assets/          # Global CSS
│   ├── components/
│   │   └── ForecastCard.vue   # 7-day forecast day card
│   ├── services/
│   │   └── weatherData.ts     # Mock weather data & logic
│   ├── types/
│   │   └── weather.ts         # TypeScript interfaces
│   ├── views/
│   │   └── HomeView.vue       # Main page (search + weather display)
│   ├── App.vue          # Root component
│   └── main.ts          # App entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
