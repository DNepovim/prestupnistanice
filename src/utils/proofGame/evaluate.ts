import { tp } from '@/utils/tp'

import { PROOF_VERDICTS } from './source'
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

const pickVerdict = ({ found, falsePositives }: Evaluation, total: number) => {
  const ratio = found.length / total
  if (ratio === 1)
    return falsePositives === 0 ? PROOF_VERDICTS.perfect : PROOF_VERDICTS.thorough
  if (falsePositives > found.length) return PROOF_VERDICTS.overeager
  if (ratio >= 0.75) return PROOF_VERDICTS.good
  if (ratio >= 0.5) return PROOF_VERDICTS.half
  return found.length > 0 ? PROOF_VERDICTS.weak : PROOF_VERDICTS.none
}

export const getVerdict = (result: Evaluation, total: number) =>
  tp(pickVerdict(result, total))
