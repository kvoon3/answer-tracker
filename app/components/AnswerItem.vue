<script setup lang="ts">
import type { Answer } from '~/types'

defineProps<{
  question: Answer
  currentQuestionId: number
}>()
</script>

<template>
  <div flex="~ col" gap2 w10 items-center>
    <span text="sm neutral-600" font-bold>{{ question.id }}</span>
    <button
      text-lg font-semibold border-2 rounded-lg size-10
      transition="all duration-200"
      :class="{
        'border-neutral-300 bg-white text-gray-700 hover:border-neutral-400': !question.value && currentQuestionId !== question.id,
        'border-teal-500 bg-teal-50 text-teal-600': question.value && currentQuestionId !== question.id,
        'border-neutral-500 bg-neutral-300/20': currentQuestionId === question.id,
      }"
    >
      {{ question.value
        ? question.value
        : currentQuestionId === question.id
          ? '-'
          : '?'
      }}
    </button>
  </div>
</template>
