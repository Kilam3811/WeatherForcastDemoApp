<template>
  <div class="forecast-card">
    <div class="fc-date">{{ day.date }}</div>
    <div class="fc-icon">{{ day.icon }}</div>
    <div class="fc-summary">{{ day.summary }}</div>
    <div class="fc-temps">
      <span class="fc-hi">{{ day.tempHigh }}°</span>
      <span class="fc-lo">{{ day.tempLow }}°</span>
    </div>
    <div class="fc-stats">
      <span title="Chance of rain">🌧️ {{ day.chanceOfRain }}%</span>
      <span title="Humidity">💧 {{ day.humidity }}%</span>
      <span title="Wind">🌬️ {{ day.windSpeed }} km/h</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayForecast } from '@/types/weather'

defineProps<{ day: DayForecast }>()
</script>

<style scoped>
.forecast-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
  padding: 1rem 0.75rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
  transition: transform 0.2s, background 0.2s;
  cursor: default;
}
.forecast-card:hover {
  background: rgba(255,255,255,0.18);
  transform: translateY(-3px);
}

.fc-date {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.65);
}
.fc-icon    { font-size: 2rem; line-height: 1; }
.fc-summary { font-size: 0.8rem; font-weight: 600; }

.fc-temps {
  display: flex;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
}
.fc-lo { color: rgba(255,255,255,0.55); font-weight: 400; }

.fc-stats {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.65);
  margin-top: 0.2rem;
  width: 100%;
}
.fc-stats span { white-space: nowrap; }
</style>
