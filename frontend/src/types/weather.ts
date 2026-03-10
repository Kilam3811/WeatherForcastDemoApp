export interface DayForecast {
  date: string        // e.g. "Mon, Mar 11"
  tempHigh: number    // °C
  tempLow: number     // °C
  summary: string
  description: string
  icon: string
  humidity: number    // 0-100 %
  windSpeed: number   // km/h
  windDirection: string
  chanceOfRain: number // 0-100 %
}

export interface CityWeather {
  city: string
  country: string
  currentTemp: number
  feelsLike: number
  summary: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
  windDirection: string
  forecast: DayForecast[]
}
