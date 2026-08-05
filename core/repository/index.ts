export class StorageRepository {
  private prefix = 'desktop_action_hub_';

  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(this.prefix + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.error(`[Repository] Failed to read key ${key}:`, e);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Repository] Failed to write key ${key}:`, e);
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.error(`[Repository] Failed to remove key ${key}:`, e);
    }
  }
}

export const repository = new StorageRepository();
