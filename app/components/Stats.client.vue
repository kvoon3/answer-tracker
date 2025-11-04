<script setup lang="ts">
import { useProfiles } from '~/composables/useProfiles'

const { currentProfile } = useProfiles()

const shortcutsEnabled = defineModel<boolean>('shortcutsEnabled', { default: true })
const showImport = defineModel<boolean>('showImport', { default: false })
const showSettings = defineModel<boolean>('showSettings', { default: false })

// Direct references to current profile data
const questionCount = computed({
  get: () => currentProfile.value?.questionCount || 130,
  set: (value) => {
    if (currentProfile.value) {
      currentProfile.value.questionCount = value
    }
  },
})

const userAnswer = computed({
  get: () => currentProfile.value?.userAnswers || [],
  set: (value) => {
    if (currentProfile.value) {
      currentProfile.value.userAnswers = [...value]
    }
  },
})

const answer = computed({
  get: () => currentProfile.value?.standardAnswers || [],
  set: (value) => {
    if (currentProfile.value) {
      currentProfile.value.standardAnswers = [...value]
    }
  },
})

// 统计信息
const answeredCount = computed(() => {
  return userAnswer.value.filter(answer => answer.value).length
})

const remainingCount = computed(() => {
  return questionCount.value - answeredCount.value
})

// 准确率统计
const correctCount = computed(() => {
  return userAnswer.value.filter((userAnswerItem) => {
    const correctAnswerItem = answer.value.find(a => a.id === userAnswerItem.id)
    return userAnswerItem.value && userAnswerItem.value === correctAnswerItem?.value
  }).length
})

const incorrectCount = computed(() => {
  return userAnswer.value.filter((userAnswerItem) => {
    const correctAnswerItem = answer.value.find(a => a.id === userAnswerItem.id)
    return userAnswerItem.value && userAnswerItem.value !== correctAnswerItem?.value
  }).length
})

const accuracyRate = computed(() => {
  const answered = answeredCount.value
  return answered > 0 ? Math.round((correctCount.value / answered) * 100) : 0
})
</script>

<template>
  <div flex="~ wrap" gap4 items-center md:gap6 text="sm">
    <!-- 快捷键状态 -->
    <div flex="~" gap2 items-center>
      <Icon
        name="ph:keyboard"
        size="18"
      />
      <span max-sm:hidden text="neutral-600">快捷键：</span>
      <span
        :class="shortcutsEnabled ? 'text-teal-600' : 'text-red-600'"
        font-semibold
      >
        {{ shortcutsEnabled ? '启用' : '禁用' }}
      </span>
    </div>

    <!-- 已做 -->
    <div flex="~" gap2 items-center>
      <Icon name="ph:check-circle" size="18" text="teal-600" />
      <span max-sm:hidden text="neutral-600">已做：</span>
      <span text="teal-600" font-semibold>{{ answeredCount }}</span>
    </div>

    <!-- 剩余 -->
    <div flex="~" gap2 items-center>
      <Icon name="ph:equalizer-duotone" size="18" text="orange-600" />
      <span max-sm:hidden text="neutral-600">剩余：</span>
      <span text="orange-600" font-semibold>{{ remainingCount }}</span>
    </div>

    <!-- 进度 -->
    <div flex="~" gap2 items-center>
      <Icon name="ph:chart-bar" size="18" text="teal-600" />
      <span max-sm:hidden text="neutral-600">进度：</span>
      <span text="teal-600" font-semibold>{{ Math.round((answeredCount / questionCount) * 100) || 0 }}%</span>
    </div>

    <!-- 正确 -->
    <div v-if="answeredCount > 0" flex="~" gap2 items-center>
      <Icon name="ph:check" size="18" text="teal-600" />
      <span max-sm:hidden text="neutral-600">正确：</span>
      <span text="teal-600" font-semibold>{{ correctCount }}</span>
    </div>

    <!-- 错误 -->
    <div v-if="answeredCount > 0" flex="~" gap2 items-center>
      <Icon name="ph:x" size="18" text="red-600" />
      <span max-sm:hidden text="neutral-600">错误：</span>
      <span text="red-600" font-semibold>{{ incorrectCount }}</span>
    </div>

    <!-- 准确率 -->
    <div v-if="answeredCount > 0" flex="~" gap2 items-center>
      <Icon
        name="ph:target" size="18"
        :class="{
          'text-teal-600': accuracyRate >= 80,
          'text-yellow-600': accuracyRate >= 60 && accuracyRate < 80,
          'text-red-600': accuracyRate < 60,
        }"
      />
      <span max-sm:hidden text="neutral-600">准确率：</span>
      <span
        :class="{
          'text-teal-600': accuracyRate >= 80,
          'text-yellow-600': accuracyRate >= 60 && accuracyRate < 80,
          'text-red-600': accuracyRate < 60,
        }"
        font-semibold
      >
        {{ accuracyRate }}%
      </span>
    </div>

    <Icon name="ph:upload-simple" size="24" @click="showImport = true" />
    <Icon name="ph:gear-six-duotone" size="24" @click="showSettings = true" />
  </div>
</template>