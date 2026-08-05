import { eventBus } from '../event-bus';

export interface SystemMetrics {
  cpuUsagePct: number;
  ramUsedMb: number;
  ramTotalMb: number;
  ramPct: number;
}

export class SystemMonitorService {
  private timerId: number | null = null;
  private metrics: SystemMetrics = {
    cpuUsagePct: 18,
    ramUsedMb: 6420,
    ramTotalMb: 16384,
    ramPct: 39,
  };

  public startMonitoring(intervalMs: number = 2000) {
    if (this.timerId !== null) return;

    this.timerId = window.setInterval(async () => {
      await this.updateMetrics();
    }, intervalMs);
  }

  public stopMonitoring() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getMetrics(): SystemMetrics {
    return this.metrics;
  }

  private async updateMetrics() {
    if ((window as any).electronAPI?.getSystemMetrics) {
      try {
        const live = await (window as any).electronAPI.getSystemMetrics();
        this.metrics = live;
      } catch (err) {
        this.simulateMetrics();
      }
    } else {
      this.simulateMetrics();
    }

    eventBus.emit('SYSTEM_METRICS_UPDATED', this.metrics);
  }

  private simulateMetrics() {
    // Smooth simulation jitter
    const cpuJitter = (Math.random() - 0.5) * 6;
    const ramJitter = (Math.random() - 0.5) * 50;

    const newCpu = Math.max(5, Math.min(95, Math.round(this.metrics.cpuUsagePct + cpuJitter)));
    const newRam = Math.max(3000, Math.min(14000, Math.round(this.metrics.ramUsedMb + ramJitter)));

    this.metrics = {
      cpuUsagePct: newCpu,
      ramUsedMb: newRam,
      ramTotalMb: 16384,
      ramPct: Math.round((newRam / 16384) * 100),
    };
  }
}

export const systemMonitorService = new SystemMonitorService();
