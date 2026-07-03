# Bornite domain model

This document summarises the reference model we studied, how Bornite adapts it,
the aggregate roots and their boundaries, the key relationships, and the two
engineered seams (deduplication and risk scoring). Assumptions and open modeling
questions are listed at the end.

---

## 1. What we extracted from the reference tooling

The reference platform organises everything under one rigid, scan-oriented tree,
with a single god-entity (`Finding`) carrying vulnerability data, asset location
and status all at once:

```
Product_Type ─1:N─ Product ─1:N─ Engagement ─1:N─ Test ─1:N─ Finding
                                     (scan run)         (occurrence, holds
                                                          CVE/CWE/CVSS/EPSS +
                                                          endpoints + ~9 status
                                                          booleans + dedup hash)
```

Supporting concepts:

- **Endpoint** + **Endpoint_Status** — a web-centric asset (scheme/host/port/
  path/query/fragment) linked to findings many-to-many, with per-pair mitigation
  status.
- **Vulnerability_Id** — a normalised side table of identifier strings (CVE, …)
  per finding, superseding a legacy single `cve` field.
- **CWE** stored as a bare integer on the finding (catalog table disconnected).
- **Test_Type** (scanner category) + **Tool_Type/Tool_Configuration** (tool
  instance & credentials) + **Test_Import/Test_Import_Finding_Action** (per-import
  provenance and per-finding actions: created/closed/reactivated/untouched).
- **Risk_Acceptance** — accept/avoid/mitigate/fix/transfer decision over a set of
  findings, with owner, expiry and reactivation policy.
- **Finding_Group** — cluster of findings (by component, file, title, vuln id).
- Deduplication via a configurable **hash_code** (case-folded SHA-256 over a
  per-scanner field set; legacy = title+cwe+line+file+description) plus a
  `unique_id_from_tool` algorithm; severity as `Info/Low/Medium/High/Critical`
  with an `S0..S4` numeric sort key.

## 2. How Bornite adapts it

The core change is to **normalise and decouple**. The reference duplicates
vulnerability knowledge on every finding and forces an org→scan tree. Bornite
splits the "what", the "where", the "how/when" and the "occurrence" into separate
aggregates and makes findings **asset-centric and persistent** rather than
per-scan.

| Reference concept | Bornite | Change |
| --- | --- | --- |
| `Finding` (god-object) | `Finding` (occurrence only) | Holds status, contextual severity, risk score, dedup key, provenance, location; references catalog & asset by id |
| CVE/CWE/CVSS/EPSS on finding | `VulnerabilityDefinition` (catalog) | Normalised, reusable "what"; one per vulnerability, referenced by many findings |
| `Endpoint` (web asset) | `Asset` (+ `AssetType`) & `Endpoint` VO | `Asset` = any host/web/container/repo/cloud thing; `Endpoint` demoted to a finding-location value object |
| `Test_Type` + `Tool_Type/Config` | `Source` | One registry aggregate for "who/what produced findings" |
| `Test` + `Test_Import` | `ScanImport` | One ingestion event; provenance for the findings it produced |
| `Engagement` | `Assessment` | Scan grouping with lifecycle + a dedup-scope flag |
| `Risk_Acceptance` | `RiskAcceptance` | Same intent, references findings by id |
| `Finding_Group` | `FindingGroup` | Same intent, references members by id |
| `Vulnerability_Id` (string) | `VulnerabilityIdentifier` VO (+ `VulnerabilitySystem`) | Namespaced (CVE/GHSA/plugin/…) instead of free text |
| ~9 status booleans | `FindingStatus` enum | Single lifecycle state with guarded transitions |
| `Product_Type`/`Product` tree | *(not modeled)* — `AssetCriticality` on `Asset` | Criticality moved to the asset; org hierarchy is an open question (§8) |

## 3. Aggregate roots and boundaries

Eight aggregate roots; **cross-aggregate references are held by id** (never object
references), so each aggregate loads and saves independently.

| Aggregate root | Owns | References (by id) |
| --- | --- | --- |
| **Asset** | identifiers, criticality, tags, lifecycle | — |
| **VulnerabilityDefinition** | identifiers, CWEs, CVSS, EPSS, KEV/exploit intel, references | — |
| **Finding** | status, severity, confidence, risk score, location, fingerprint, timestamps | asset, vulnerabilityDefinition, source, scanImport?, assessment?, duplicateOf?, riskAcceptance? |
| **Source** | name, type, enabled | — |
| **ScanImport** | status, counts, file/report metadata | source, assessment? |
| **Assessment** | name, status, window, dedup-scope flag | — |
| **RiskAcceptance** | decision, justification, expiry, owner | acceptedFindings[] |
| **FindingGroup** | name, group-by | members[], assessment? |

`Finding` is the consistency boundary for a single occurrence. It does **not**
embed the asset or the catalog entry — it points at them — which is what lets one
`VulnerabilityDefinition` (e.g. Log4Shell) be reused across thousands of findings
and lets asset inventory live independently of scans.

## 4. Key relationships

```
Asset  1 ────────< N  Finding  N >──────── 1  VulnerabilityDefinition
                          │  │  │
        Source 1 >────────┘  │  └────────< N  RiskAcceptance (M:N via acceptedFindingIds)
                             │
        ScanImport 1 >───────┤            FindingGroup N >──────── N Finding (members)
                             │
        Assessment 1 >───────┴──> groups ScanImports; FindingGroup optionally scoped to one

Source 1 ────< N ScanImport      Assessment 1 ────< N ScanImport
```

- A **Finding** = (VulnerabilityDefinition detected on Asset by Source), created
  within a ScanImport, optionally under an Assessment.
- **RiskAcceptance ↔ Finding** is many-to-many in principle; the finding also
  stores the `riskAcceptanceId` that currently governs it. An application service
  keeps both sides consistent (`RiskAcceptance.addFinding` + `Finding.accept`).
- **FindingGroup ↔ Finding** is many-to-many by member ids.

## 5. Value objects

`Severity` (+ `SeverityLevel`), `CvssScore`, `CvssVector`, `EpssScore`,
`RiskScore` (0–100 with bands), `CveId`, `Cwe`, `VulnerabilityIdentifier`,
`AssetIdentifier`, `Port`, `Endpoint`, `FindingLocation`, `FindingFingerprint`.

All are immutable (`Object.freeze`), compared structurally, and validated in their
factories with Zod. Notable behaviour: `Severity.fromCvssScore()` /
`.fromLabel()`; `CvssVector` validates shape and carries a supplied base score but
does **not** compute CVSS (pluggable, out of scope); `FindingLocation.descriptor()`
produces the stable projection used for deduplication.

## 6. Enums

`SeverityLevel`, `FindingStatus`, `AssetType`, `AssetIdentifierKind`,
`AssetCriticality`, `SourceType`, `ConfidenceLevel`, `RiskTreatment`,
`AssessmentStatus`, `ScanImportStatus`, `VulnerabilitySystem`,
`TransportProtocol`, `FindingGroupBy`.

`FindingStatus` = `Open | Confirmed | FalsePositive | OutOfScope | Duplicate |
RiskAccepted | Mitigated | Resolved` — a single lifecycle replacing the reference's
overlapping booleans, with `Open`/`Confirmed` counting as "active".

## 7. The two seams

Both live on `Finding` and delegate to injected **ports** in
`libs/domain/services`, so neither is hardcoded.

### Deduplication seam — `FindingFingerprintStrategy`

`Finding.assignFingerprint(strategy, { vulnerabilityIdentifiers, cwe })` computes
a `FindingFingerprint` — a **canonical composite string** (not a crypto digest;
the persistence layer may hash it for indexing). The reference implementation
mirrors the three common approaches:

- stable tool id present → `uid::<assetId>::<uniqueIdFromTool>`;
- else → `h::<assetId>::<sorted vuln identifiers | title fallback>::cwe::<location>`.

The repository lookup `FindingRepository.findByFingerprint(fingerprint, assetId?)`
is the merge point: an incoming finding either matches an incumbent (update
`lastDetectedAt`, possibly reopen) or is new.

### Risk-scoring seam — `RiskScoringStrategy`

`Finding.applyRiskScore(strategy, context)` — the finding contributes its own
severity/confidence; the caller supplies external factors (EPSS, CVSS, KEV,
`AssetCriticality`) gathered from the catalog and asset. The reference
`DefaultRiskScoringStrategy` blends them transparently on a 0–100 scale:

```
threat   = max(severityWeight, cvss/10)
exploit  = knownExploited ? 1 : epss.probability
exposure = assetCriticalityWeight
score    = 100 · (0.45·threat + 0.30·exploit + 0.25·exposure) · confidenceFactor
```

It is deliberately simple and explainable; deployments are expected to inject
their own model (SSVC, vendor scores, ML).

## 8. Assumptions

1. **Findings are asset-centric and persistent**, not per-scan. A re-scan updates
   an existing finding (dedup on fingerprint) rather than creating a new row each
   time. `firstDetectedAt`/`lastDetectedAt` track its life.
2. **Status booleans collapsed into one `FindingStatus`.** Consequence: a finding
   cannot be simultaneously "Confirmed" and "RiskAccepted" — acceptance is a state
   that supersedes confirmation. The prior confirmation is history, not current
   state. (See open questions.)
3. **Org hierarchy is out of scope.** Asset criticality lives on the `Asset`; there
   is no `Product`/`Product_Type` grouping yet.
4. **CVSS is not computed** from the vector; the source/caller provides the score.
5. **Ids are supplied from outside** the domain (app/persistence generate UUIDs);
   the domain stays free of I/O and non-determinism. Timestamps are passed into
   methods (e.g. `mitigate(at)`) for the same reason.
6. **Repository interfaces live in the domain** as ports. They could later move to
   a dedicated application/ports layer without changing the implementations.
7. **Zod is allowed inside the domain** — it is a pure, deterministic validator
   with no I/O — and is wrapped so only domain errors escape.
8. **Fingerprint is a readable composite string**, not a hash; persistence stores
   it in an indexed column (and may hash it if a fixed width is wanted).
9. **Persistence stores value-object collections as `jsonb`** (identifiers, CWEs,
   CVSS, EPSS, location, counts, member/accepted id arrays) rather than child
   tables — simplest faithful representation for this stage.

## 9. Open modeling questions

1. **Organisation / tenancy / authorization.** Do we need a `Product` /
   `BusinessUnit` grouping (and authorized-users scoping) above `Asset`, as the
   reference has? This affects multi-tenancy and access control.
2. **SLA policy.** The reference models per-severity remediation SLAs. Where should
   SLA configuration and breach state live — on `Asset`, an org unit, or a global
   policy referenced by findings?
3. **Multiple locations per finding.** A single vulnerability may affect many
   endpoints/URLs with independent mitigation status (the reference's
   `Endpoint_Status`). Bornite currently models one `FindingLocation` per finding;
   multi-location findings would be separate findings or a group. Do we need
   per-location status?
4. **Observation history.** Should we add a `FindingObservation` child (one row per
   detection per scan import, with an action of created/reactivated/closed/
   untouched) to preserve per-source, per-scan history — instead of only
   first/last-seen on the finding?
5. **Confirmed + RiskAccepted co-existence.** If auditors need "this was a verified
   true positive that is now risk-accepted", we may need an orthogonal
   `verified` flag alongside the lifecycle enum.
6. **Catalog identity & merging.** How do we dedup `VulnerabilityDefinition`s when a
   scanner supplies only a plugin id (no CVE) and later a CVE is learned for the
   same issue? A merge/alias mechanism may be needed.
7. **Asset matching precedence.** When identifiers conflict across scans (e.g. same
   IP, different hostname), what is the authoritative matching/merge rule?
8. **Notes, attachments, audit trail** are not modeled yet.
