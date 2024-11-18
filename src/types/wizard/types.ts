export type WizardStepStatus = 'pending' | 'visited' | 'complete' | 'skipped'

export interface WizardStep {
  id: string
  status: WizardStepStatus
  title?: string
}

export interface WizardState {
  steps: WizardStep[]
  stepMap: { [key: string]: WizardStep }
  finishedCount: number
  pendingCount: number
  firstUnfinishedStepId?: string
  firstUnfinishedStepIndex: number
  lastStepId: string
  finished: boolean
}
