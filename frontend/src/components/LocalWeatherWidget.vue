<template>
  <div
    v-if="!dismissed"
    class="local-widget"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    @mousedown="startDrag"
    @touchstart.passive="startDragTouch"
    role="region"
    aria-label="Local weather widget"
  >
    <!-- Drag handle / header -->
    <div class="widget-header">
      <span class="widget-title">📍 My Location</span>
      <button class="widget-close" aria-label="Close local weather widget" @click.stop="dismissed = true">✕</button>
    </div>

    <!-- Loading -->
    <div v-if="locationLoading" class="widget-body widget-loading">
      <div class="mini-spinner"></div>
      <span>Detecting location…</span>
    </div>

    <!-- Error -->
    <div v-else-if="locationError" class="widget-body widget-error">
      <span>{{ locationError }}</span>
    </div>

    <!-- Weather data -->
    <div v-else-if="localWeather" class="widget-body">
      <div class="widget-city">
        {{ localWeather.city }}<span class="widget-country">{{ localWeather.country }}</span>
      </div>
      <div class="widget-main">
        <span class="widget-icon">{{ localWeather.icon }}</span>
        <span class="widget-temp">{{ localWeather.currentTemp }}<span class="widget-unit">°C</span></span>
      </div>
      <div class="widget-summary">{{ localWeather.summary }}</div>
      <div class="widget-stats">
        <span>💧 {{ localWeather.humidity }}%</span>
        <span>🌬️ {{ localWeather.windSpeed }} km/h</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getWeatherByCoords } from '@/services/weatherData'
import type { CityWeather } from '@/types/weather'

// ─── Widget dimensions (used for clamping drag to viewport) ──────────────────
const WIDGET_WIDTH = 220
const WIDGET_HEIGHT = 160
const GEOLOCATION_TIMEOUT_MS = 10000

// ─── Position & drag state ────────────────────────────────────────────────────
const pos = ref({ x: 20, y: 80 })
const dismissed = ref(false)

let dragging = false
let dragOffset = { x: 0, y: 0 }

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return
  pos.value = {
    x: clamp(e.clientX - dragOffset.x, 0, window.innerWidth - WIDGET_WIDTH),
    y: clamp(e.clientY - dragOffset.y, 0, window.innerHeight - WIDGET_HEIGHT),
  }
}

function onTouchMove(e: TouchEvent) {
  if (!dragging) return
  const touch = e.touches[0]
  if (!touch) return
  pos.value = {
    x: clamp(touch.clientX - dragOffset.x, 0, window.innerWidth - WIDGET_WIDTH),
    y: clamp(touch.clientY - dragOffset.y, 0, window.innerHeight - WIDGET_HEIGHT),
  }
}

function stopDrag() {
  dragging = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', stopDrag)
}

function startDrag(e: MouseEvent) {
  // Ignore clicks on the close button
  if ((e.target as HTMLElement).classList.contains('widget-close')) return
  dragging = true
  dragOffset.x = e.clientX - pos.value.x
  dragOffset.y = e.clientY - pos.value.y
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
}

function startDragTouch(e: TouchEvent) {
  if ((e.target as HTMLElement).classList.contains('widget-close')) return
  const touch = e.touches[0]
  if (!touch) return
  dragging = true
  dragOffset.x = touch.clientX - pos.value.x
  dragOffset.y = touch.clientY - pos.value.y
  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchend', stopDrag)
}

onUnmounted(stopDrag)

// ─── Geolocation & weather ────────────────────────────────────────────────────
const locationLoading = ref(true)
const locationError = ref<string | null>(null)
const localWeather = ref<CityWeather | null>(null)

onMounted(() => {
  if (!navigator.geolocation) {
    locationLoading.value = false
    locationError.value = 'Geolocation not supported by this browser.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const weather = getWeatherByCoords(latitude, longitude)
      locationLoading.value = false
      if (weather) {
        localWeather.value = weather
      } else {
        locationError.value = 'Could not determine nearest city.'
      }
    },
    () => {
      locationLoading.value = false
      locationError.value = 'Location access denied.'
    },
    { timeout: GEOLOCATION_TIMEOUT_MS },
  )
})
</script>

<style scoped>
.local-widget {
  position: fixed;
  z-index: 500;
  width: 210px;
  background: rgba(15, 30, 55, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: #fff;
  user-select: none;
  cursor: grab;
}

.local-widget:active {
  cursor: grabbing;
}

/* Header / drag handle */
.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.widget-title {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.8);
}

.widget-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
  transition: color 0.15s;
}

.widget-close:hover {
  color: #fff;
}

/* Body */
.widget-body {
  padding: 0.75rem 0.9rem 0.9rem;
}

/* Loading */
.widget-loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.widget-error {
  font-size: 0.82rem;
  color: rgba(255, 200, 150, 0.9);
  text-align: center;
}

/* City row */
.widget-city {
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.widget-country {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.05rem 0.35rem;
}

/* Temperature row */
.widget-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.widget-icon {
  font-size: 2rem;
  line-height: 1;
}

.widget-temp {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.widget-unit {
  font-size: 1rem;
  font-weight: 400;
}

/* Summary */
.widget-summary {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 0.5rem;
}

/* Stats row */
.widget-stats {
  display: flex;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
}
</style>
