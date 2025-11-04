export interface Answer {
  id: number
  value?: string
}

export interface Profile {
  id: string
  name: string
  createTime: Date
  questionCount: number
  userAnswers: Answer[]
  standardAnswers: Answer[]
}
