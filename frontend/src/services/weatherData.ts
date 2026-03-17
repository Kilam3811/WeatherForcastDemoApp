import type { CityWeather, DayForecast } from '@/types/weather'

// ─── City catalogue ────────────────────────────────────────────────────────────
interface CityConfig {
  country: string
  baseTemp: number
  summaries: string[]
  lat: number
  lon: number
}

const CITIES: Record<string, CityConfig> = {
  'New York':    { country: 'US', baseTemp: 15, lat: 40.7128,  lon: -74.0060,  summaries: ['Partly Cloudy', 'Sunny', 'Overcast', 'Light Rain', 'Clear'] },
  'London':      { country: 'GB', baseTemp: 10, lat: 51.5074,  lon: -0.1278,   summaries: ['Overcast', 'Rainy', 'Partly Cloudy', 'Foggy', 'Light Rain'] },
  'Tokyo':       { country: 'JP', baseTemp: 18, lat: 35.6762,  lon: 139.6503,  summaries: ['Sunny', 'Clear', 'Partly Cloudy', 'Humid', 'Warm'] },
  'Sydney':      { country: 'AU', baseTemp: 22, lat: -33.8688, lon: 151.2093,  summaries: ['Sunny', 'Clear', 'Partly Cloudy', 'Breezy', 'Warm'] },
  'Paris':       { country: 'FR', baseTemp: 12, lat: 48.8566,  lon: 2.3522,    summaries: ['Partly Cloudy', 'Overcast', 'Light Rain', 'Clear', 'Breezy'] },
  'Berlin':      { country: 'DE', baseTemp: 8,  lat: 52.5200,  lon: 13.4050,   summaries: ['Overcast', 'Light Rain', 'Partly Cloudy', 'Cold', 'Windy'] },
  'Dubai':       { country: 'AE', baseTemp: 38, lat: 25.2048,  lon: 55.2708,   summaries: ['Sunny', 'Hot', 'Clear', 'Hazy', 'Scorching'] },
  'Toronto':     { country: 'CA', baseTemp: 5,  lat: 43.6532,  lon: -79.3832,  summaries: ['Partly Cloudy', 'Snowy', 'Cold', 'Overcast', 'Clear'] },
  'Mumbai':      { country: 'IN', baseTemp: 30, lat: 19.0760,  lon: 72.8777,   summaries: ['Humid', 'Partly Cloudy', 'Sunny', 'Hazy', 'Warm'] },
  'São Paulo':   { country: 'BR', baseTemp: 25, lat: -23.5505, lon: -46.6333,  summaries: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Warm', 'Breezy'] },
  'Mexico City': { country: 'MX', baseTemp: 20, lat: 19.4326,  lon: -99.1332,  summaries: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Clear', 'Breezy'] },
  'Cairo':       { country: 'EG', baseTemp: 32, lat: 30.0444,  lon: 31.2357,   summaries: ['Sunny', 'Hot', 'Clear', 'Hazy', 'Dusty'] },
  'Moscow':      { country: 'RU', baseTemp: -2, lat: 55.7558,  lon: 37.6173,   summaries: ['Snowy', 'Cold', 'Overcast', 'Freezing', 'Blizzard'] },
  'Beijing':     { country: 'CN', baseTemp: 14, lat: 39.9042,  lon: 116.4074,  summaries: ['Smoggy', 'Partly Cloudy', 'Clear', 'Windy', 'Hazy'] },
  'Los Angeles': { country: 'US', baseTemp: 24, lat: 34.0522,  lon: -118.2437, summaries: ['Sunny', 'Clear', 'Partly Cloudy', 'Breezy', 'Warm'] },
}

const ICONS: Record<string, string> = {
  'Sunny':         '☀️',
  'Clear':         '🌙',
  'Partly Cloudy': '⛅',
  'Overcast':      '☁️',
  'Light Rain':    '🌦️',
  'Rainy':         '🌧️',
  'Thunderstorm':  '⛈️',
  'Snowy':         '❄️',
  'Foggy':         '🌫️',
  'Windy':         '🌬️',
  'Hot':           '🔥',
  'Cold':          '🧊',
  'Humid':         '💧',
  'Hazy':          '🌫️',
  'Breezy':        '🍃',
  'Warm':          '🌤️',
  'Dusty':         '🌪️',
  'Smoggy':        '🏙️',
  'Freezing':      '🥶',
  'Blizzard':      '🌨️',
  'Scorching':     '🌡️',
}

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

// ─── Deterministic pseudo-random (seeded) ─────────────────────────────────────
function seededRand(seed: number) {
  // simple 32-bit LCG
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function randInt(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1))
}

// ─── Description helper ────────────────────────────────────────────────────────
function describe(summary: string, temp: number): string {
  const map: Record<string, string> = {
    'Sunny':         `Bright sunshine with a high of ${temp}°C. A great day to be outdoors.`,
    'Clear':         `Clear skies, ${temp}°C. Excellent visibility throughout the day.`,
    'Partly Cloudy': `Mix of sun and clouds, ${temp}°C. Pleasant conditions expected.`,
    'Overcast':      `Cloudy skies all day, ${temp}°C. No rain expected.`,
    'Light Rain':    `Light showers likely, ${temp}°C. Carry an umbrella.`,
    'Rainy':         `Heavy rain expected, ${temp}°C. Consider staying indoors.`,
    'Snowy':         `Snowfall expected, ${temp}°C. Roads may be slippery.`,
    'Foggy':         `Dense fog advisory, ${temp}°C. Drive with caution.`,
    'Hot':           `Extremely hot conditions, ${temp}°C. Stay hydrated.`,
    'Cold':          `Cold temperatures, ${temp}°C. Bundle up before heading out.`,
    'Windy':         `Strong winds expected, ${temp}°C. Secure loose items.`,
    'Thunderstorm':  `Severe thunderstorm warning, ${temp}°C. Stay indoors.`,
    'Freezing':      `Dangerously cold, ${temp}°C. Limit time outdoors.`,
    'Blizzard':      `Blizzard conditions, ${temp}°C. Avoid all travel.`,
    'Scorching':     `Extreme heat alert, ${temp}°C. Avoid outdoor activities.`,
    'Humid':         `Muggy and humid, ${temp}°C. Feels hotter than the temperature suggests.`,
    'Hazy':          `Hazy skies, ${temp}°C. Air quality may be reduced.`,
    'Breezy':        `Refreshing breeze, ${temp}°C. A pleasant day overall.`,
    'Warm':          `Comfortably warm at ${temp}°C. Enjoy the weather!`,
    'Dusty':         `Dusty conditions, ${temp}°C. Keep windows closed.`,
    'Smoggy':        `Smog advisory in effect, ${temp}°C. Limit outdoor exposure.`,
  }
  return map[summary] ?? `Conditions: ${summary}, ${temp}°C.`
}

function rainChance(summary: string, rand: () => number): number {
  const ranges: Record<string, [number, number]> = {
    'Rainy':        [80, 100],
    'Light Rain':   [50, 80],
    'Thunderstorm': [85, 100],
    'Snowy':        [60, 90],
    'Blizzard':     [90, 100],
    'Overcast':     [20, 50],
    'Partly Cloudy':[10, 30],
    'Foggy':        [30, 60],
  }
  const [lo, hi] = ranges[summary] ?? [0, 15]
  return randInt(rand, lo, hi)
}

function formatDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ─── Public API ────────────────────────────────────────────────────────────────
export function getSupportedCities(): string[] {
  return Object.keys(CITIES).sort()
}

// Haversine distance in km between two lat/lon points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Returns weather for the nearest city in the catalogue to the given coordinates
export function getWeatherByCoords(lat: number, lon: number): CityWeather | null {
  let nearestCity = ''
  let minDist = Infinity
  for (const [name, cfg] of Object.entries(CITIES)) {
    const dist = haversineKm(lat, lon, cfg.lat, cfg.lon)
    if (dist < minDist) {
      minDist = dist
      nearestCity = name
    }
  }
  return nearestCity ? getWeather(nearestCity) : null
}

export function getWeather(cityName: string): CityWeather | null {
  const cfg = CITIES[cityName]
  if (!cfg) return null

  const daySeed = new Date().getFullYear() * 1000 + new Date().getMonth() * 31 + new Date().getDate()
  const citySeed = [...cityName].reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const rand = seededRand(citySeed ^ daySeed)

  const pick = (arr: string[]): string => arr[Math.floor(rand() * arr.length)] ?? arr[0]!

  const currentSummary = pick(cfg.summaries)
  const currentTemp    = cfg.baseTemp + randInt(rand, -5, 5)
  const feelsLike      = currentTemp + randInt(rand, -3, 3)

  const forecast: DayForecast[] = Array.from({ length: 7 }, (_, i) => {
    const dayRand = seededRand((citySeed ^ daySeed) + (i + 1) * 997)
    const summary = cfg.summaries[Math.floor(dayRand() * cfg.summaries.length)] ?? cfg.summaries[0]!
    const hi      = cfg.baseTemp + randInt(dayRand, -8, 8)
    const lo      = hi - randInt(dayRand, 2, 10)
    return {
      date:          formatDate(i + 1),
      tempHigh:      hi,
      tempLow:       lo,
      summary,
      description:   describe(summary, hi),
      icon:          ICONS[summary] ?? '🌡️',
      humidity:      randInt(dayRand, 30, 95),
      windSpeed:     randInt(dayRand, 0, 60),
      windDirection: WIND_DIRS[randInt(dayRand, 0, WIND_DIRS.length - 1)] ?? 'N',
      chanceOfRain:  rainChance(summary, dayRand),
    }
  })

  return {
    city:         cityName,
    country:      cfg.country,
    currentTemp,
    feelsLike,
    summary:      currentSummary,
    description:  describe(currentSummary, currentTemp),
    icon:         ICONS[currentSummary] ?? '🌡️',
    humidity:     randInt(rand, 30, 95),
    windSpeed:    randInt(rand, 0, 60),
    windDirection:WIND_DIRS[randInt(rand, 0, WIND_DIRS.length - 1)] ?? 'N',
    forecast,
  }
}
