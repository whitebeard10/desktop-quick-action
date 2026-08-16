import { eventBus } from '../event-bus';

export interface WeatherData {
  city: string;
  tempC: number;
  condition: string;
  humidityPct: number;
  windKmH: number;
  feelsLikeC: number;
  forecast: Array<{ day: string; highC: number; lowC: number; condition: string }>;
  lastUpdated: number;
  error?: string;
}

const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  80: 'Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + Hail', 99: 'Heavy Thunderstorm',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STORAGE_KEY = 'weather_city';

const DEFAULT_DATA: WeatherData = {
  city: 'Loading...',
  tempC: 0,
  condition: 'Fetching weather...',
  humidityPct: 0,
  windKmH: 0,
  feelsLikeC: 0,
  forecast: [],
  lastUpdated: 0,
};

export class WeatherService {
  private data: WeatherData = { ...DEFAULT_DATA };
  private isLoading = false;

  constructor() {
    const savedCity = this.getSavedCity();
    this.fetchWeather(savedCity);
  }

  private getSavedCity(): string {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'New Delhi';
    } catch {
      return 'New Delhi';
    }
  }

  private saveCity(city: string) {
    try {
      localStorage.setItem(STORAGE_KEY, city);
    } catch {}
  }

  public getWeather(): WeatherData {
    return this.data;
  }

  public isLoading_(): boolean {
    return this.isLoading;
  }

  // Search city by name → get lat/lon from Open-Meteo geocoding API
  private async geocode(cityName: string): Promise<{ name: string; lat: number; lon: number; country: string } | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    if (!json.results || json.results.length === 0) return null;
    const r = json.results[0];
    return { name: r.name, lat: r.latitude, lon: r.longitude, country: r.country_code?.toUpperCase() || '' };
  }

  // Fetch real weather data from Open-Meteo (no API key required)
  private async fetchFromOpenMeteo(lat: number, lon: number): Promise<Partial<WeatherData> | null> {
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${lat}&longitude=${lon}`,
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`,
      `&daily=temperature_2m_max,temperature_2m_min,weather_code`,
      `&forecast_days=4&timezone=auto`,
    ].join('');

    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();

    const c = json.current;
    const d = json.daily;

    const today = new Date();
    const forecast = [0, 1, 2, 3].map((i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        day: i === 0 ? 'Today' : DAY_NAMES[date.getDay()],
        highC: Math.round(d.temperature_2m_max[i]),
        lowC: Math.round(d.temperature_2m_min[i]),
        condition: WMO_CONDITIONS[d.weather_code[i]] || 'Unknown',
      };
    });

    return {
      tempC: Math.round(c.temperature_2m),
      feelsLikeC: Math.round(c.apparent_temperature),
      humidityPct: Math.round(c.relative_humidity_2m),
      windKmH: Math.round(c.wind_speed_10m),
      condition: WMO_CONDITIONS[c.weather_code] || 'Unknown',
      forecast,
      lastUpdated: Date.now(),
    };
  }

  public async fetchWeather(cityName: string): Promise<WeatherData> {
    if (this.isLoading) return this.data;
    this.isLoading = true;

    try {
      const geo = await this.geocode(cityName);
      if (!geo) {
        this.data = { ...this.data, error: `City "${cityName}" not found`, city: cityName };
        eventBus.emit('WEATHER_DATA_UPDATED', this.data);
        return this.data;
      }

      const weather = await this.fetchFromOpenMeteo(geo.lat, geo.lon);
      if (!weather) {
        this.data = { ...this.data, error: 'Weather fetch failed', city: geo.name };
        eventBus.emit('WEATHER_DATA_UPDATED', this.data);
        return this.data;
      }

      this.data = {
        ...this.data,
        ...weather,
        city: geo.country ? `${geo.name}, ${geo.country}` : geo.name,
        error: undefined,
      };
      this.saveCity(cityName);
      eventBus.emit('WEATHER_DATA_UPDATED', this.data);
    } catch (err) {
      this.data = { ...this.data, error: 'Network error — check your connection' };
      eventBus.emit('WEATHER_DATA_UPDATED', this.data);
    } finally {
      this.isLoading = false;
    }

    return this.data;
  }

  // Keep old API surface for backward compat
  public async refreshWeather(city?: string): Promise<WeatherData> {
    return this.fetchWeather(city || this.data.city);
  }
}

export const weatherService = new WeatherService();
