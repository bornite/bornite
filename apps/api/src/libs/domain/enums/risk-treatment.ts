/**
 * Risk treatment decision recorded on a {@link RiskAcceptance}. The classic
 * accept / avoid / mitigate / fix / transfer set.
 */
export enum RiskTreatment {
  /** The risk is acknowledged and remains. */
  Accept = 'ACCEPT',
  /** Do not engage with whatever creates the risk. */
  Avoid = 'AVOID',
  /** Compensating controls make it less of a threat. */
  Mitigate = 'MITIGATE',
  /** The risk is eradicated. */
  Fix = 'FIX',
  /** The risk is transferred to a third party. */
  Transfer = 'TRANSFER',
}
