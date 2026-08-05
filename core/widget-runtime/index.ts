import { WidgetInstance } from '@/types';
import { eventBus } from '../event-bus';

export class WidgetRuntime {
  private activeWidgets: Map<string, WidgetInstance> = new Map();
  private timerIds: Map<string, number> = new Map();

  public registerWidget(widget: WidgetInstance) {
    this.activeWidgets.set(widget.id, widget);

    if (widget.refreshIntervalMs > 0) {
      const timer = window.setInterval(() => {
        this.refreshWidget(widget.id);
      }, widget.refreshIntervalMs);
      this.timerIds.set(widget.id, timer);
    }

    eventBus.emit('WIDGET_REGISTERED', widget);
  }

  public unregisterWidget(id: string) {
    if (this.timerIds.has(id)) {
      clearInterval(this.timerIds.get(id));
      this.timerIds.delete(id);
    }
    this.activeWidgets.delete(id);
    eventBus.emit('WIDGET_UNREGISTERED', id);
  }

  public refreshWidget(id: string) {
    const widget = this.activeWidgets.get(id);
    if (widget) {
      eventBus.emit('WIDGET_REFRESHED', { id, type: widget.type, timestamp: Date.now() });
    }
  }

  public getActiveWidgets(): WidgetInstance[] {
    return Array.from(this.activeWidgets.values());
  }

  public toggleExpand(id: string) {
    const widget = this.activeWidgets.get(id);
    if (widget) {
      widget.isExpanded = !widget.isExpanded;
      eventBus.emit('WIDGET_STATE_CHANGED', widget);
    }
  }
}

export const widgetRuntime = new WidgetRuntime();
