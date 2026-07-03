/**
 * Port for generating aggregate identifiers. Ids are minted in the application
 * layer (not the domain), keeping the domain free of I/O and non-determinism.
 */
export interface IdGenerator {
  generate(): string;
}
