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

export interface ProfileStorage {
  id: string | null
  profiles: Profile[]
}
