import { eventBus } from '../event-bus';

export interface BatteryStatus {
  levelPct: number;
  isCharging: boolean;
  chargingTimeSec: number;
  dischargingTimeSec: number;
}

export class BatteryService {
  private status: BatteryStatus = {
    levelPct: 88,
    isCharging: false,
    chargingTimeSec: 0,
    dischargingTimeSec: 14400,
  };

  public async init() {
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        this.updateFromNavigator(battery);

        battery.addEventListener('levelchange', () => this.updateFromNavigator(battery));
        battery.addEventListener('chargingchange', () => this.updateFromNavigator(battery));
      } catch (e) {
        console.log('[BatteryService] Using simulated battery data');
      }
    }
  }

  private updateFromNavigator(battery: any) {
    this.status = {
      levelPct: Math.round(battery.level * 100),
      isCharging: battery.charging,
      chargingTimeSec: battery.chargingTime,
      dischargingTimeSec: battery.dischargingTime,
    };
    eventBus.emit('BATTERY_STATUS_UPDATED', this.status);
  }

  public getStatus(): BatteryStatus {
    return this.status;
  }
}

export const batteryService = new BatteryService();
