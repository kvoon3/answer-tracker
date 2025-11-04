import type { Answer, Profile, ProfileStorage } from '~/types'

export function useProfiles() {
  const data = useLocalStorage<ProfileStorage>('answer-sheet-profiles', {
    id: null,
    profiles: [],
  })

  // Generate a unique ID for new profiles
  const generateId = (): string => {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create a new profile
  const createProfile = (name?: string, questionCount: number = 100): Profile => {
    const profileName = name || `Profile ${new Date().toLocaleDateString()}`
    const newProfile: Profile = {
      id: generateId(),
      name: profileName,
      createTime: new Date(),
      questionCount,
      userAnswers: Array.from({ length: questionCount }, (_, i) => ({ id: i + 1, value: undefined })),
      standardAnswers: Array.from({ length: questionCount }, (_, i) => ({ id: i + 1, value: undefined })),
    }

    data.value.profiles.push(newProfile)

    // If this is the first profile, set it as current
    if (data.value.profiles.length === 1) {
      data.value.id = newProfile.id
    }

    return newProfile
  }

  // Get current profile
  const currentProfile = computed<Profile | null>(() => {
    if (!data.value.id)
      return null
    return data.value.profiles.find(p => p.id === data.value.id) || null
  })

  // Switch to a different profile
  const switchProfile = (profileId: string): boolean => {
    const profile = data.value.profiles.find(p => p.id === profileId)
    if (profile) {
      data.value.id = profileId
      return true
    }
    return false
  }

  // Delete a profile
  const deleteProfile = (profileId: string): boolean => {
    const profileIndex = data.value.profiles.findIndex(p => p.id === profileId)
    if (profileIndex === -1)
      return false

    const isCurrentProfile = data.value.id === profileId

    // Remove the profile
    data.value.profiles.splice(profileIndex, 1)

    // Handle current profile switching if we deleted the current one
    if (isCurrentProfile) {
      if (data.value.profiles.length > 0) {
        // Switch to the most recent profile (last in array)
        data.value.id = data.value.profiles[data.value.profiles.length - 1]!.id
      }
      else {
        // No profiles left, create a default one
        const defaultProfile = createProfile()
        data.value.id = defaultProfile.id
      }
    }

    return true
  }

  // Edit profile name
  const editProfileName = (profileId: string, newName: string): boolean => {
    const profile = data.value.profiles.find(p => p.id === profileId)
    if (profile && newName.trim()) {
      profile.name = newName.trim()
      return true
    }
    return false
  }

  // Update user answers in current profile
  const updateUserAnswers = (answers: Answer[]): boolean => {
    if (!currentProfile.value)
      return false

    const profile = data.value.profiles.find(p => p.id === currentProfile.value!.id)
    if (profile) {
      profile.userAnswers = [...answers]
      return true
    }
    return false
  }

  // Update standard answers in current profile
  const updateStandardAnswers = (answers: Answer[]): boolean => {
    if (!currentProfile.value)
      return false

    const profile = data.value.profiles.find(p => p.id === currentProfile.value!.id)
    if (profile) {
      profile.standardAnswers = [...answers]
      return true
    }
    return false
  }

  // Update question count in current profile
  const updateQuestionCount = (count: number): boolean => {
    if (!currentProfile.value)
      return false

    const profile = data.value.profiles.find(p => p.id === currentProfile.value!.id)
    if (profile) {
      // Resize arrays if count changes
      if (count > profile.questionCount) {
        // Add new empty answers
        const newUserAnswers = [...profile.userAnswers]
        const newStandardAnswers = [...profile.standardAnswers]

        for (let i = profile.questionCount + 1; i <= count; i++) {
          newUserAnswers.push({ id: i, value: undefined })
          newStandardAnswers.push({ id: i, value: undefined })
        }

        profile.userAnswers = newUserAnswers
        profile.standardAnswers = newStandardAnswers
      }
      else if (count < profile.questionCount) {
        // Remove extra answers
        profile.userAnswers = profile.userAnswers.slice(0, count)
        profile.standardAnswers = profile.standardAnswers.slice(0, count)
      }

      profile.questionCount = count
      return true
    }
    return false
  }

  // Initialize with default profile if none exist
  const initializeProfiles = () => {
    if (data.value.profiles.length === 0) {
      createProfile()
    }
  }

  return {
    storage: readonly(data),
    profiles: computed(() => data.value.profiles),
    currentProfile,
    createProfile,
    switchProfile,
    deleteProfile,
    editProfileName,
    updateUserAnswers,
    updateStandardAnswers,
    updateQuestionCount,
    initializeProfiles,
  }
}
