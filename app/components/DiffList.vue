<script setup lang="ts">
import type { Answer } from '~/types'

const userAnswer = defineModel<Answer[]>('userAnswer', { default: () => [] })
const answer = defineModel<Answer[]>('answer', { default: () => [] })

const diffResults = computed(() => {
  return userAnswer.value.map((userAnswerItem) => {
    const correctAnswerItem = answer.value.find(a => a.id === userAnswerItem.id)
    const isCorrect = userAnswerItem.value === correctAnswerItem?.value

    return {
      id: userAnswerItem.id,
      userAnswer: userAnswerItem.value,
      correctAnswer: correctAnswerItem?.value,
      isCorrect,
    }
  })
})

const groupedDiffResults = computed(() => {
  const groups = []
  for (let i = 0; i < diffResults.value.length; i += 5) {
    groups.push(diffResults.value.slice(i, i + 5))
  }
  return groups
})
</script>

<template>
  <div>
    <div v-for="(group, groupIndex) in groupedDiffResults" :key="groupIndex" mb6>
      <div flex="~ wrap" gap4 justify="center">
        <div
          v-for="(result) in group"
          :key="result.id"
          flex="~ col"
          gap2 w16 items-center
        >
          <span text="sm neutral-600">{{ result.id }}</span>
          <div
            text-lg font-semibold border-2 rounded-lg flex h12 w12 items-center justify-center
            transition="all duration-200"
            :class="{
              'border-green-500 bg-green-50 text-green-600': result.isCorrect && result.userAnswer,
              'border-red-500 bg-red-50 text-red-600': !result.isCorrect && result.userAnswer,
              'border-neutral-300 bg-white text-gray-700': !result.userAnswer,
            }"
          >
            {{ result.userAnswer || '?' }}
          </div>
          <div v-if="!result.isCorrect && result.correctAnswer" text="xs red-500">
            正确答案: {{ result.correctAnswer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
