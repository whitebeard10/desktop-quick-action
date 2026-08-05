import { BubbleState } from '@/types';
import { eventBus } from '../event-bus';

export class BubbleStateMachine {
  private currentState: BubbleState = 'idle';
  private previousState: BubbleState = 'idle';

  constructor(initialState: BubbleState = 'idle') {
    this.currentState = initialState;
  }

  public getState(): BubbleState {
    return this.currentState;
  }

  public getPreviousState(): BubbleState {
    return this.previousState;
  }

  public transitionTo(newState: BubbleState, payload?: any): boolean {
    if (this.currentState === newState) return false;

    // Validate state transitions
    if (!this.isValidTransition(this.currentState, newState)) {
      console.warn(`[BubbleStateMachine] Invalid state transition from "${this.currentState}" to "${newState}"`);
      return false;
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    eventBus.emit('BUBBLE_STATE_CHANGED', {
      from: this.previousState,
      to: this.currentState,
      payload,
    });

    return true;
  }

  private isValidTransition(from: BubbleState, to: BubbleState): boolean {
    // Disabled state can only transition back via reset
    if (from === 'disabled' && to !== 'idle') return false;

    // All states can transition to error or expanded or hidden
    if (['error', 'expanded', 'hidden', 'disabled'].includes(to)) return true;

    switch (from) {
      case 'idle':
        return ['hover', 'dragging', 'expanded', 'hidden', 'notification', 'loading'].includes(to);
      case 'hover':
        return ['idle', 'dragging', 'expanded', 'hidden', 'notification'].includes(to);
      case 'dragging':
        return ['idle', 'hover', 'expanded', 'hidden'].includes(to);
      case 'expanded':
        return ['idle', 'hover', 'hidden'].includes(to);
      case 'hidden':
        return ['idle', 'hover', 'expanded', 'notification'].includes(to);
      case 'notification':
        return ['idle', 'hover', 'expanded', 'hidden'].includes(to);
      case 'loading':
        return ['idle', 'expanded', 'error'].includes(to);
      case 'error':
        return ['idle', 'disabled'].includes(to);
      default:
        return true;
    }
  }
}

export const bubbleFSM = new BubbleStateMachine('idle');
