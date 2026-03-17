<template>
  <div class="temp-indicator" :aria-label="`Temperature indicator: ${currentTemp}°C, ${categoryLabel}`">
    <!-- Category label -->
    <div class="temp-category">
      <span class="category-icon">{{ categoryIcon }}</span>
      <span class="category-text">{{ categoryLabel }}</span>
    </div>

    <!-- Gradient bar with markers -->
    <div class="bar-wrapper">
      <!-- Today's high/low range band -->
      <div
        class="range-band"
        :style="{
          left: lowPosition + '%',
          width: (highPosition - lowPosition) + '%',
        }"
        :aria-label="`Today's range: ${safeLow}°C – ${safeHigh}°C`"
      ></div>

      <!-- Current temperature marker -->
      <div class="marker" :style="{ left: currentPosition + '%' }">
        <div class="marker-pin"></div>
        <div class="marker-label">{{ currentTemp }}°</div>
      </div>
    </div>

    <!-- Scale labels -->
    <div class="scale-labels">
      <span>{{ SCALE_MIN }}°C</span>
      <span>{{ SCALE_MAX }}°C</span>
    </div>

    <!-- High / Low legend -->
    <div class="hl-legend">
      <span class="hl-lo">↓ {{ safeLow }}°C</span>
      <span class="hl-hi">↑ {{ safeHigh }}°C</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentTemp: number
  todayHigh: number
  todayLow: number
}>()

/** Temperature scale bounds for the gradient bar (°C). */
const SCALE_MIN = -20
const SCALE_MAX = 50
const SCALE_RANGE = SCALE_MAX - SCALE_MIN

function toPercent(temp: number): number {
  return Math.min(100, Math.max(0, ((temp - SCALE_MIN) / SCALE_RANGE) * 100))
}

const currentPosition = computed(() => toPercent(props.currentTemp))

/** Ensure low ≤ high before computing positions to avoid negative widths. */
const safeLow  = computed(() => Math.min(props.todayLow, props.todayHigh))
const safeHigh = computed(() => Math.max(props.todayLow, props.todayHigh))

const highPosition = computed(() => toPercent(safeHigh.value))
const lowPosition  = computed(() => toPercent(safeLow.value))

/** Ordered from hottest to coldest; first match wins. */
const CATEGORIES = [
  { threshold: 35, label: 'Hot',      icon: '🔥'  },
  { threshold: 20, label: 'Warm',     icon: '☀️'  },
  { threshold:  8, label: 'Mild',     icon: '🌤️' },
  { threshold:  0, label: 'Cold',     icon: '❄️'  },
  { threshold: -Infinity, label: 'Freezing', icon: '🥶' },
] as const

const category = computed(() =>
  CATEGORIES.find(c => props.currentTemp >= c.threshold) ?? CATEGORIES[CATEGORIES.length - 1]!
)

const categoryLabel = computed(() => category.value.label)
const categoryIcon  = computed(() => category.value.icon)
</script>

<style scoped>
.temp-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

/* Category label */
.temp-category {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.category-icon { font-size: 1rem; line-height: 1; }

/* Gradient bar */
.bar-wrapper {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    #2563eb 0%,        /* -20 °C – deep blue   */
    #60a5fa 28.6%,     /*   0 °C – sky blue    */
    #34d399 42.9%,     /*  10 °C – teal green  */
    #fbbf24 57.1%,     /*  20 °C – amber       */
    #f97316 78.6%,     /*  35 °C – orange      */
    #dc2626 100%       /*  50 °C – red         */
  );
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* High/low range band */
.range-band {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

/* Current temperature marker */
.marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.marker-pin {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}
.marker-label {
  position: absolute;
  top: calc(100% + 4px);
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* Scale labels */
.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1.2rem; /* space for marker label */
}

/* High / Low legend */
.hl-legend {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}
.hl-lo { color: #93c5fd; }
.hl-hi { color: #fca5a5; }
</style>
