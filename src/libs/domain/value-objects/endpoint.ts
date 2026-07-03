import { z } from 'zod';
import { parse } from '../shared/parse';
import { ValueObject } from '../shared/value-object';

const hostSchema = z.string().trim().toLowerCase().min(1, 'must not be empty');
const portSchema = z.number().int().min(1).max(65535);

export interface EndpointInput {
  scheme?: string;
  host: string;
  port?: number;
  path?: string;
  query?: string;
  fragment?: string;
}

/**
 * A web/URL location: the DAST counterpart of a source-code location. Uses the
 * usual URL decomposition (scheme/host/port/path/query/fragment) but as an
 * immutable value object rather than a persisted row.
 *
 * Note the split of concerns: an {@link Asset} answers "which system", while an
 * Endpoint pins "where on that system" for a specific finding.
 */
export class Endpoint extends ValueObject {
  private constructor(
    public readonly scheme: string | null,
    public readonly host: string,
    public readonly port: number | null,
    public readonly path: string | null,
    public readonly query: string | null,
    public readonly fragment: string | null,
  ) {
    super();
    Object.freeze(this);
  }

  public static create(input: EndpointInput): Endpoint {
    const host = parse(hostSchema, input.host, 'Endpoint host');
    const port = input.port === undefined ? null : parse(portSchema, input.port, 'Endpoint port');
    return new Endpoint(
      input.scheme?.trim().toLowerCase() || null,
      host,
      port,
      // Paths are stored without a leading slash, by convention.
      input.path?.replace(/^\/+/, '') || null,
      input.query?.replace(/^\?/, '') || null,
      input.fragment?.replace(/^#/, '') || null,
    );
  }

  /** Canonical URL-ish string, stable for equality and dedup. */
  public canonical(): string {
    const scheme = this.scheme ? `${this.scheme}://` : '';
    const port = this.port ? `:${this.port}` : '';
    const path = this.path ? `/${this.path}` : '';
    const query = this.query ? `?${this.query}` : '';
    const fragment = this.fragment ? `#${this.fragment}` : '';
    return `${scheme}${this.host}${port}${path}${query}${fragment}`;
  }

  public override toString(): string {
    return this.canonical();
  }
}
