/**
 * Dependency-injection tokens for the ports the application depends on. Symbols
 * (not strings) to avoid collisions. The infrastructure layer binds each to a
 * concrete adapter; the application code references only the port interfaces.
 */
export const FINDING_READ_STORE = Symbol('FindingReadStore');
export const FINDING_REPOSITORY = Symbol('FindingRepository');
export const RISK_ACCEPTANCE_REPOSITORY = Symbol('RiskAcceptanceRepository');
export const CONNECTOR_CATALOG = Symbol('ConnectorCatalog');
export const SOURCE_REGISTRY = Symbol('SourceRegistry');
export const ID_GENERATOR = Symbol('IdGenerator');
export const CLOCK = Symbol('Clock');
