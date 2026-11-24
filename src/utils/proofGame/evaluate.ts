import { tp } from '@/utils/tp'

import { PROOF_FALLBACK_VERDICT, PROOF_VERDICTS } from './source'
import { PROOF_DECOYS, PROOF_ERRORS, PROOF_WORDS, type ProofRecord } from './text'

export type Evaluation = {
  found: readonly ProofRecord[]
  missed: readonly ProofRecord[]
  decoys: readonly ProofRecord[]
  hasLooseWords: boolean
  falsePositives: number
}

export const evaluate = (selected: ReadonlySet<number>): Evaluation => {
  const isHit = (record: ProofRecord) => record.area.some((index) => selected.has(index))
  const found = PROOF_ERRORS.filter(isHit)
  const decoys = PROOF_DECOYS.filter(isHit)
  const loose = [...selected]
    .filter((index) => !PROOF_WORDS[index]?.recordId)
    .toSorted((a, b) => a - b)
  const looseRuns = loose.filter(
    (index, position) =>
      !(
        position > 0 &&
        loose[position - 1] === index - 1 &&
        PROOF_WORDS[index - 1]?.line === PROOF_WORDS[index]?.line
      ),
  ).length
  return {
    found,
    missed: PROOF_ERRORS.filter((record) => !isHit(record)),
    decoys,
    hasLooseWords: looseRuns > 0,
    falsePositives: decoys.length + looseRuns,
  }
}

export const getVerdict = (found: number, total: number) =>
  tp(
    PROOF_VERDICTS.find(([minimum]) => found / total >= minimum)?.[1] ??
      PROOF_FALLBACK_VERDICT,
  )

export const pluralize = (
  count: number,
  [one, few, many]: readonly [string, string, string],
) => {
  if (count === 1) return one
  if (count >= 2 && count <= 4) return few
  return many
}
