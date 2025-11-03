<script setup lang="ts">
import type { Answer } from '~/types'
import AnswerList from '~/components/AnswerList.vue'

const questionCount = ref(130)
const activeTab = ref<'answer' | 'input' | 'diff'>('answer')
const userAnswer = ref<Answer[]>([])
const answer = ref<Answer[]>([])
const currentQuestionId = ref<number>(0)

const tabs = [
  { id: 'answer' as const, name: '答题' },
  { id: 'input' as const, name: '录入答案' },
  { id: 'diff' as const, name: '对比' },
]

const options = ['A', 'B', 'C', 'D']

function initializeQuestions() {
  userAnswer.value = Array.from({ length: questionCount.value }, (_, i) => ({
    id: i + 1,
    value: undefined,
  }))
  answer.value = Array.from({ length: questionCount.value }, (_, i) => ({
    id: i + 1,
    value: undefined,
  }))
}

function handleOptionSelect(option: string) {
  if (currentQuestionId.value !== null) {
    if (activeTab.value === 'answer') {
      const answerItem = userAnswer.value.find(q => q.id === currentQuestionId.value)
      if (answerItem) {
        answerItem.value = option
      }
    }
    else {
      const answerItem = answer.value.find(q => q.id === currentQuestionId.value)
      if (answerItem) {
        answerItem.value = option
      }
    }
  }

  // 自动开始下一题
  const currentArray = activeTab.value === 'answer' ? userAnswer.value : answer.value
  const currentIndex = currentArray.findIndex(q => q.id === currentQuestionId.value)
  const nextQuestion = currentArray[currentIndex + 1]

  if (nextQuestion) {
    currentQuestionId.value = nextQuestion.id
  }
  else {
    currentQuestionId.value = 0
  }
}

onMounted(() => {
  initializeQuestions()
})
</script>

<template>
  <div h="screen" bg="neutral-50" text-neutral-500 relative>
    <header p4 bg-white shadow-sm>
      <h1 text="2xl center neutral-800" font="bold">
        Quick Answer Diff
      </h1>
    </header>

    <main flex1 p4>
      <div mb6 p6 rounded-lg bg-white shadow-sm>
        <h2 text="xl neutral-800" font-semibold mb4>
          设置题目数量
        </h2>
        <div flex="~ wrap" gap4 items="center">
          <input
            v-model.number="questionCount"
            type="number"
            min="1" max="100"
            border="1 neutral-300 rounded" p="x-3 y-2"
            text-center bg-white w32
            @change="initializeQuestions"
          >
          <span text="neutral-600">道题目</span>
        </div>
      </div>

      <div rounded-lg bg-white shadow-sm>
        <div flex="~" border="b-1 neutral-200">
          <button
            v-for="tab in tabs" :key="tab.id"
            flex1 font-medium p4 text-center border="b-2 transparent"
            :class="{ 'border-blue-500 text-blue-600': activeTab === tab.id, 'text-neutral-500': activeTab !== tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div p4>
          <AnswerList v-if="activeTab === 'answer'" v-model:questions="userAnswer" v-model:current-question-id="currentQuestionId" />
          <AnswerList v-else-if="activeTab === 'input'" v-model:questions="answer" v-model:current-question-id="currentQuestionId" />
          <DiffList v-else-if="activeTab === 'diff'" v-model:user-answer="userAnswer" v-model:answer="answer" />
        </div>
      </div>
    </main>

    <footer border="t-1 neutral-200" p4 bg-white shadow-lg bottom-0 sticky space-y-2>
      <div flex="~ wrap" gap3 items-center justify-center>
        <button
          @click="currentQuestionId--"
        >
          Prev
        </button>
        <button
          v-for="option in options" :key="option"
          text="white lg" font-semibold rounded-lg bg-blue-500 size-8 transition="all duration-200" hover="bg-blue-600 scale-105" active="scale-95"
          @click="handleOptionSelect(option)"
        >
          {{ option }}
        </button>
        <button @click="currentQuestionId++">
          Next
        </button>
      </div>
    </footer>
  </div>
</template>
