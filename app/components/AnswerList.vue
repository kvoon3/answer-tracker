<script setup lang="ts">
import type { Answer } from '~/types'

const questions = defineModel<Answer[]>('questions', { default: () => [] })
const currentQuestionId = defineModel<number>('currentQuestionId', { default: 0 })

const groupedQuestions = computed(() => {
  const groups = []
  for (let i = 0; i < questions.value.length; i += 5) {
    groups.push(questions.value.slice(i, i + 5))
  }
  return groups
})
</script>

<template>
  <div>
    <div v-for="(group, groupIndex) in groupedQuestions" :key="groupIndex" mb6>
      <div flex="~ wrap" gap4 justify="center">
        <div
          v-for="(question) in group"
          :key="question.id"
          flex="~ col"
          gap2 w16 items-center
        >
          <span text="sm neutral-600">{{ question.id }}</span>
          <button
            text-lg font-semibold border-2 rounded-lg h12 w12
            transition="all duration-200"
            :class="{
              'border-neutral-300 bg-white text-gray-700 hover:border-neutral-400': !question.value && currentQuestionId !== question.id,
              'border-blue-500 bg-blue-50 text-blue-600': question.value && currentQuestionId !== question.id,
              'border-neutral-500 bg-neutral-300/20': currentQuestionId === question.id,
            }"
            @click="currentQuestionId = question.id"
          >
            {{ question.value
              ? question.value
              : currentQuestionId === question.id
                ? '-'
                : '?'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
