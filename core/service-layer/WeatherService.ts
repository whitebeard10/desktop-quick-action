import { eventBus } from '../event-bus';

export interface WeatherData {
  city: string;
  tempC: number;
  condition: string;
  humidityPct: number;
  windKmH: number;
  forecast: Array<{ day: string; tempC: number; condition: string }>;
}

export class WeatherService {
  private data: WeatherData = {
    city: 'Seattle, WA',
    tempC: 22,
    condition: 'Partly Cloudy',
    humidityPct: 58,
    windKmH: 12,
    forecast: [
      { day: 'Today', tempC: 22, condition: 'Partly Cloudy' },
      { day: 'Thu', tempC: 24, condition: 'Sunny' },
      { day: 'Fri', tempC: 19, condition: 'Rain' },
    ],
  };

  public getWeather(): WeatherData {
    return this.data;
  }

  public async refreshWeather(city?: string): Promise<WeatherData> {
    if (city) {
      this.data.city = city;
    }
    // Simulate slight temperature variation on refresh
    this.data.tempC = Math.round(20 + Math.random() * 5);
    eventBus.emit('WEATHER_DATA_UPDATED', this.data);
    return this.data;
  }
}

export const weatherService = new WeatherService();
