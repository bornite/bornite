import { z } from 'zod';
import { TransportProtocol } from '../enums/transport-protocol';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const schema = z.number().int().min(1).max(65535);

/** A network port (1–65535) with its transport protocol. */
export class Port extends ValueObject {
  private constructor(
    public readonly number: number,
    public readonly protocol: TransportProtocol,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(portNumber: number, protocol: TransportProtocol = TransportProtocol.Tcp): Port {
    return new Port(parse(schema, portNumber, 'Port number'), protocol);
  }

  public override toString(): string {
    return `${this.number}/${this.protocol}`;
  }
}
