import { ValueObject } from '../shared/value-object';
import { Endpoint } from './endpoint';
import { Port } from './port';

export interface FindingLocationInput {
  filePath?: string;
  line?: number;
  symbol?: string;
  endpoint?: Endpoint;
  port?: Port;
}

/**
 * Where, precisely, a finding was observed on its asset — a source file+line, a
 * SAST symbol, a web endpoint, and/or a network port. Distinct from the asset
 * identity itself.
 *
 * The {@link descriptor} is a stable projection consumed by the default
 * fingerprint strategy for deduplication.
 */
export class FindingLocation extends ValueObject {
  private constructor(
    public readonly filePath: string | null,
    public readonly line: number | null,
    /** SAST source/sink symbol (variable, function, …). */
    public readonly symbol: string | null,
    /** Canonical form of the web endpoint, when the finding is DAST-style. */
    public readonly endpoint: string | null,
    /** Canonical form of the affected network port, when relevant. */
    public readonly port: string | null,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(input: FindingLocationInput = {}): FindingLocation {
    return new FindingLocation(
      input.filePath?.trim() || null,
      input.line ?? null,
      input.symbol?.trim() || null,
      input.endpoint ? input.endpoint.canonical() : null,
      input.port ? input.port.toString() : null,
    );
  }

  /**
   * Rebuild from already-canonical primitives (persistence). Unlike
   * {@link create}, the endpoint and port are supplied as their stored canonical
   * strings rather than as {@link Endpoint}/{@link Port} value objects.
   */
  public static reconstitute(record: {
    filePath: string | null;
    line: number | null;
    symbol: string | null;
    endpoint: string | null;
    port: string | null;
  }): FindingLocation {
    return new FindingLocation(
      record.filePath,
      record.line,
      record.symbol,
      record.endpoint,
      record.port,
    );
  }

  public isEmpty(): boolean {
    return (
      this.filePath === null &&
      this.line === null &&
      this.symbol === null &&
      this.endpoint === null &&
      this.port === null
    );
  }

  /** Stable, order-fixed descriptor for hashing/dedup. Empty parts are skipped. */
  public descriptor(): string {
    const parts: string[] = [];
    if (this.endpoint) {
      parts.push(`endpoint=${this.endpoint}`);
    }
    if (this.port) {
      parts.push(`port=${this.port}`);
    }
    if (this.filePath) {
      parts.push(`file=${this.filePath}`);
    }
    if (this.line !== null) {
      parts.push(`line=${this.line}`);
    }
    if (this.symbol) {
      parts.push(`symbol=${this.symbol}`);
    }
    return parts.join('|');
  }
}
