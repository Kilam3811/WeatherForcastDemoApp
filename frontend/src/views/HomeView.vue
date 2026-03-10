<template>
  <div class="app-wrapper" :class="themeClass">
    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-icon">🌤️</span>
          <span class="brand-name">WeatherCast</span>
        </div>
        <div class="search-bar" role="search">
          <span class="search-icon">🔍</span>
          <input
            v-model="query"
            type="text"
            placeholder="Search a city…"
            aria-label="Search city"
            autocomplete="off"
            @input="onInput"
            @keydown.enter="selectFirst"
            @keydown.escape="closeSuggestions"
            @focus="onInput"
          />
          <button v-if="query" class="clear-btn" aria-label="Clear search" @click="clearSearch">✕</button>
          <ul v-if="suggestions.length" class="suggestions" role="listbox">
            <li v-for="city in suggestions" :key="city" role="option" @mousedown.prevent="selectCity(city)">
              {{ city }}
            </li>
          </ul>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main">
      <!-- Empty state -->
      <section v-if="!weather && !loading && !error" class="empty-state">
        <div class="empty-icon">🌍</div>
        <h2>Search for a city to see the weather</h2>
        <p>Try: London, Tokyo, New York, Dubai…</p>
        <div class="quick-chips">
          <button v-for="city in quickCities" :key="city" class="chip" @click="selectCity(city)">{{ city }}</button>
        </div>
      </section>

      <!-- Loading -->
      <section v-else-if="loading" class="loading-state" aria-live="polite">
        <div class="spinner"></div>
        <p>Fetching weather…</p>
      </section>

      <!-- Error -->
      <section v-else-if="error" class="error-state" role="alert">
        <div class="error-icon">😕</div>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="clearSearch">Try another city</button>
      </section>

      <!-- Weather -->
      <template v-else-if="weather">
        <section class="current-card">
          <div class="current-left">
            <div class="city-name">
              {{ weather.city }}<span class="country-badge">{{ weather.country }}</span>
            </div>
            <div class="current-date">{{ todayLabel }}</div>
            <div class="current-summary">{{ weather.summary }}</div>
            <p class="current-desc">{{ weather.description }}</p>
          </div>
          <div class="current-right">
            <div class="current-icon">{{ weather.icon }}</div>
            <div class="current-temp">{{ weather.currentTemp }}<span class="unit">°C</span></div>
            <div class="feels-like">Feels like {{ weather.feelsLike }}°C</div>
          </div>
          <div class="current-stats">
            <div class="stat">
              <span class="stat-label">💧 Humidity</span>
              <span class="stat-value">{{ weather.humidity }}%</span>
            </div>
            <div class="stat">
              <span class="stat-label">🌬️ Wind</span>
              <span class="stat-value">{{ weather.windSpeed }} km/h {{ weather.windDirection }}</span>
            </div>
          </div>
        </section>

        <section class="forecast-section">
          <h2 class="section-title">7-Day Forecast</h2>
          <div class="forecast-grid">
            <ForecastCard v-for="day in weather.forecast" :key="day.date" :day="day" />
          </div>
        </section>
      </template>
    </main>

    <footer class="app-footer">
      <p>🌤️ WeatherCast &mdash; powered by mock data &mdash; {{ currentYear }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ForecastCard from '@/components/ForecastCard.vue'
import { getSupportedCities, getWeather } from '@/services/weatherData'
import type { CityWeather } from '@/types/weather'

const allCities   = getSupportedCities()
const quickCities = ['London', 'Tokyo', 'New York', 'Dubai', 'Sydney']
const currentYear = new Date().getFullYear()

const query    = ref('')
const weather  = ref<CityWeather | null>(null)
const loading  = ref(false)
const error    = ref<string | null>(null)
const showSugg = ref(false)

const suggestions = computed<string[]>(() => {
  if (!showSugg.value || query.value.trim().length === 0) return []
  const q = query.value.trim().toLowerCase()
  return allCities.filter(c => c.toLowerCase().includes(q)).slice(0, 8)
})

const themeClass = computed(() => {
  if (!weather.value) return 'theme-default'
  const t = weather.value.currentTemp
  if (t >= 35) return 'theme-hot'
  if (t >= 20) return 'theme-warm'
  if (t >= 8)  return 'theme-mild'
  if (t >= 0)  return 'theme-cold'
  return 'theme-freezing'
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
)

function onInput() { showSugg.value = true; error.value = null }
function closeSuggestions() { showSugg.value = false }

function clearSearch() {
  query.value = ''
  weather.value = null
  error.value = null
  showSugg.value = false
}

function selectFirst() {
  const first = suggestions.value[0]
  if (first) selectCity(first)
}

function selectCity(city: string) {
  query.value = city
  showSugg.value = false
  fetchWeather(city)
}

function fetchWeather(city: string) {
  loading.value = true
  error.value = null
  weather.value = null
  setTimeout(() => {
    const result = getWeather(city)
    loading.value = false
    if (result) {
      weather.value = result
    } else {
      error.value = `No weather data available for "${city}".`
    }
  }, 400)
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background 0.5s;
}

/* Themes */
.theme-default  { background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%); }
.theme-hot      { background: linear-gradient(135deg, #7b2d00 0%, #e25822 100%); }
.theme-warm     { background: linear-gradient(135deg, #2d5a1b 0%, #f4a128 100%); }
.theme-mild     { background: linear-gradient(135deg, #1e3a5f 0%, #3a7bd5 100%); }
.theme-cold     { background: linear-gradient(135deg, #003366 0%, #6090c0 100%); }
.theme-freezing { background: linear-gradient(135deg, #0a0a2e 0%, #2a4080 100%); }

/* Header */
.app-header {
  backdrop-filter: blur(8px);
  background: rgba(0,0,0,0.25);
  border-bottom: 1px solid rgba(255,255,255,0.12);
  padding: 0.75rem 1.5rem;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  white-space: nowrap;
}
.brand-icon { font-size: 1.6rem; }

/* Search */
.search-bar {
  position: relative;
  flex: 1;
  min-width: 220px;
}
.search-bar input {
  width: 100%;
  padding: 0.55rem 2.5rem 0.55rem 2.2rem;
  border-radius: 999px;
  border: none;
  background: rgba(255,255,255,0.18);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: background 0.2s;
  box-sizing: border-box;
}
.search-bar input::placeholder { color: rgba(255,255,255,0.6); }
.search-bar input:focus { background: rgba(255,255,255,0.28); }
.search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.clear-btn {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}
.clear-btn:hover { color: #fff; }

/* Suggestions */
.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #1a2e4a;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  list-style: none;
  margin: 0;
  padding: 0.4rem 0;
  z-index: 100;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  overflow: hidden;
}
.suggestions li {
  padding: 0.55rem 1.1rem;
  color: #e0eeff;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.15s;
}
.suggestions li:hover { background: rgba(255,255,255,0.1); }

/* Main */
.main {
  flex: 1;
  padding: 2rem 1.5rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 5rem;
  color: rgba(255,255,255,0.9);
}
.empty-icon { font-size: 5rem; margin-bottom: 1rem; }
.empty-state h2 { font-size: 1.5rem; margin: 0 0 0.5rem; }
.empty-state p  { color: rgba(255,255,255,0.65); margin: 0 0 1.5rem; }
.quick-chips { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; }
.chip {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.chip:hover { background: rgba(255,255,255,0.28); }

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6rem;
  color: rgba(255,255,255,0.85);
  gap: 1rem;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6rem;
  color: rgba(255,255,255,0.9);
  gap: 0.8rem;
}
.error-icon { font-size: 3rem; }
.btn-retry {
  padding: 0.5rem 1.4rem;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.btn-retry:hover { background: rgba(255,255,255,0.35); }

/* Current card */
.current-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 24px;
  padding: 2rem 2.5rem;
  color: #fff;
  margin-bottom: 2rem;
}
.current-left  { grid-column: 1; grid-row: 1; }
.current-right { grid-column: 2; grid-row: 1; text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
.current-stats { grid-column: 1 / -1; grid-row: 2; display: flex; gap: 2rem; flex-wrap: wrap; }

.city-name {
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.15rem;
}
.country-badge {
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
}
.current-date    { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
.current-summary { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.4rem; }
.current-desc    { font-size: 0.9rem; color: rgba(255,255,255,0.75); max-width: 420px; margin: 0; }
.current-icon    { font-size: 4rem; line-height: 1; margin-bottom: 0.3rem; }
.current-temp    { font-size: 4rem; font-weight: 700; line-height: 1; }
.unit            { font-size: 2rem; font-weight: 400; }
.feels-like      { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 0.3rem; }
.stat            { display: flex; flex-direction: column; }
.stat-label      { font-size: 0.8rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value      { font-size: 1.05rem; font-weight: 600; }

/* Forecast */
.section-title {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 1rem;
}
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 600px) {
  .current-card { grid-template-columns: 1fr; padding: 1.5rem; }
  .current-right { align-items: flex-start; text-align: left; }
  .current-stats { gap: 1rem; }
  .current-temp  { font-size: 3rem; }
}
</style>
