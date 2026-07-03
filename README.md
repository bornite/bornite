# Bornite

**Bornite** is an open-source, risk-based vulnerability management (RBVM)
platform. It ingests findings from many kinds of security scanners
(network, SAST, DAST, SCA, CSPM, …), deduplicates them against a normalised
vulnerability catalog and an asset inventory, and prioritises them with a
pluggable risk-scoring model.

This repository currently contains the **model layer only** — a pure, framework-
agnostic domain layer and a separate Postgres persistence layer. There is no
NestJS wiring or database connection yet.

## Status

| Layer | State |
| --- | --- |
| Domain (`src/libs/domain`) | ✅ Entities, value objects, enums, repository ports, domain-service ports |
| Persistence (`src/architecture/database/postgres`) | ✅ ORM entities, mappers, repository implementations (skeletons; no `DataSource` wired) |
| Application / NestJS modules | ⛔ Not started (out of scope for this task) |

## Layout

```
src/
  libs/domain/                     # Pure domain — depends on nothing outward (only Zod, a pure validator)
    entities/                      # Aggregate roots with identity + lifecycle
    value-objects/                 # Immutable, validated, identity-less values
    enums/                         # Closed vocabularies
    services/                      # Domain-service PORTS + reference implementations (risk scoring, dedup)
    repositories/                  # Repository PORTS (interfaces) — dependency inversion
    shared/                        # Base classes: Entity, AggregateRoot, ValueObject, errors, Zod bridge
  architecture/database/postgres/  # Postgres persistence — may depend on the domain, never the reverse
    entities/                      # TypeORM ORM models (tables/columns) — distinct from domain entities
    mappers/                       # Bidirectional domain <-> ORM translation
    repositories/                  # Concrete Postgres implementations of the domain repository ports
```

See [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) for the domain model write-up:
the concepts extracted from the reference tooling, how they were adapted,
the aggregate roots and boundaries, the deduplication and risk-scoring seams,
and the open modeling questions.

## Design principles

- **Clean architecture / dependency inversion.** The domain defines repository
  and domain-service *ports*; the persistence layer implements them. Dependencies
  point inward.
- **Rich domain, not anemic.** Entities own their invariants and lifecycle
  transitions (e.g. `Finding.accept()`, `Finding.mitigate()`); value objects
  validate in their factories and are immutable.
- **Pluggable risk scoring and deduplication.** Both are ports with reference
  implementations, swappable without touching the entities.
- **Validation with [Zod](https://zod.dev).** Value objects and entity factories
  parse/validate with Zod; failures surface as domain errors, never `ZodError`.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit (strict)
npm run build       # emit to dist/
```

- TypeScript strict mode, one class per file, kebab-case filenames,
  index barrels per folder, no `any`.

## License

Bornite is licensed under the **GNU Affero General Public License v3.0 or later**
(AGPL-3.0-or-later) — see [`LICENSE`](LICENSE). The AGPL keeps Bornite genuinely
open source while requiring anyone who runs a modified version as a network
service to publish their source.

See [`ACKNOWLEDGEMENTS.md`](ACKNOWLEDGEMENTS.md) for prior-art credits.
