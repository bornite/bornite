import { Clock } from '../../application';

/** Clock backed by the system wall clock. */
export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
