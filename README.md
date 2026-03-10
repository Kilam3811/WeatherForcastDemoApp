# WeatherCast – Vue 3 Weather Forecast Demo App

A lightweight, self-contained weather forecast application built with **Vue 3** and **Vite**.  
All weather data is generated client-side using deterministic mock data – no backend or API key required.

---

## ✨ Features

- 🔍 **City search** with live autocomplete (15 cities pre-loaded)
- 🌡️ **Current conditions** – temperature, feels-like, humidity, wind
- 📅 **7-day forecast** cards with high/low temps, rain chance, and wind
- 🎨 **Dynamic theme** – background colour shifts with the temperature
- 📱 **Responsive** – works on desktop and mobile

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📖 Full Installation Guide

See **[docs/INSTALLATION.md](docs/INSTALLATION.md)** for step-by-step setup,
dependency details, production build instructions, and troubleshooting.

## 🗂️ Project Structure

```
WeatherForcastDemoApp/
├── frontend/       # Vue 3 + Vite application
│   └── src/
│       ├── components/     ForecastCard.vue
│       ├── services/       weatherData.ts  (mock data)
│       ├── types/          weather.ts
│       └── views/          HomeView.vue
└── docs/
    └── INSTALLATION.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Routing | Vue Router 5 |
| Data | Mock data (no API calls) |
