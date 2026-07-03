import { randomUUID } from 'node:crypto';
import { IdGenerator } from '../../application';

/** IdGenerator backed by `crypto.randomUUID()` (UUID v4). */
export class CryptoIdGenerator implements IdGenerator {
  public generate(): string {
    return randomUUID();
  }
}
