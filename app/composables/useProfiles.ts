import type { Profile } from '~/types'

export function useProfiles() {
  const profiles = useLocalStorage<Record<string, Profile>>('answer-sheet-profiles', {})
  const currentProfileId = useLocalStorage<string | null>('answer-sheet-current-profile-id', null)

  // Generate a unique ID for new profiles
  const generateId = (): string => `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

    profiles.value[newProfile.id] = newProfile

    // If this is the first profile, set it as current
    if (Object.keys(profiles.value).length === 1) {
      currentProfileId.value = newProfile.id
    }

    return newProfile
  }

  // Get current profile
  const currentProfile = computed<Profile | null>(() => {
    if (!currentProfileId.value)
      return null
    return profiles.value[currentProfileId.value] || null
  })

  // Switch to a different profile
  const switchProfile = (profileId: string): boolean => {
    if (profiles.value[profileId]) {
      currentProfileId.value = profileId
      return true
    }
    return false
  }

  // Delete a profile
  const deleteProfile = (profileId: string): boolean => {
    if (!profiles.value[profileId])
      return false

    const isCurrentProfile = currentProfileId.value === profileId

    // Remove the profile
    delete profiles.value[profileId]

    // Handle current profile switching if we deleted the current one
    if (isCurrentProfile) {
      const profileIds = Object.keys(profiles.value)
      if (profileIds.length > 0) {
        // Switch to the most recent profile (last in object keys)
        currentProfileId.value = profileIds[profileIds.length - 1]!
      }
      else {
        // No profiles left, create a default one
        const defaultProfile = createProfile()
        currentProfileId.value = defaultProfile.id
      }
    }

    return true
  }

  // Edit profile name
  const editProfileName = (profileId: string, newName: string): boolean => {
    const profile = profiles.value[profileId]
    if (profile && newName.trim()) {
      profile.name = newName.trim()
      return true
    }
    return false
  }

  // Update question count in current profile
  const updateQuestionCount = (count: number): boolean => {
    if (!currentProfile.value)
      return false

    const profile = profiles.value[currentProfile.value.id]
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
  const initializeProfiles = () => Object.keys(profiles.value).length === 0 && createProfile()

  return {
    profiles,
    currentProfileId,
    currentProfile,
    createProfile,
    switchProfile,
    deleteProfile,
    editProfileName,
    updateQuestionCount,
    initializeProfiles,
  }
}
