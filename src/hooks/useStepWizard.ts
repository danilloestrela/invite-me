import { WizardState } from '@/types'
import { useMemo } from 'react'

export function useWizardStepState(wizard: WizardState, stepId?: string) {
  return useMemo(() => {
    const { steps, stepMap, firstUnfinishedStepIndex } = wizard
    const step = stepMap[stepId!] ? stepMap[stepId!] : undefined
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const prevStep = steps[stepIndex - 1]
    const prevStepId = prevStep ? prevStep.id : undefined
    const nextStep = steps[stepIndex + 1]
    const nextStepId = nextStep ? nextStep.id : undefined

    return {
      step,
      stepIndex,
      isAhead: firstUnfinishedStepIndex > -1 && stepIndex > firstUnfinishedStepIndex,
      isLastStep: stepIndex === steps.length - 1,
      isFinished: step && (step.status === 'complete' || step.status === 'skipped'),
      prevStepId,
      nextStepId
    }
  }, [wizard, stepId])
}