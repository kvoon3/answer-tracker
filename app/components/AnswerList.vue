<script setup lang="ts">
import type { Answer } from '~/types'
import { Menu } from 'floating-vue'
import { nextTick, ref, watch } from 'vue'

const answers = defineModel<Answer[]>('questions', { default: () => [] })
const currentQuestionId = defineModel<number>('currentQuestionId', { default: 0 })

// Refs for question elements to enable auto-scrolling
const questionRefs = ref<Record<number, HTMLElement>>({})

const groupedQuestions = computed(() => {
  const groups = []
  for (let i = 0; i < answers.value.length; i += 5) {
    groups.push(answers.value.slice(i, i + 5))
  }
  return groups
})

// 选项列表
const options = ['A', 'B', 'C', 'D']

// 处理选项选择
function handleOptionSelect(questionId: number, option: string) {
  const answer = answers.value.find(q => q.id === questionId)
  if (answer) {
    answer.value = option
  }
}

// 自动滚动到当前聚焦的问题
function scrollToQuestion(questionId: number) {
  const element = questionRefs.value[questionId]
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }
}

// 监听当前问题ID变化，自动滚动到该问题
watch(currentQuestionId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await nextTick()
    scrollToQuestion(newId)
  }
})
</script>

<template>
  <div>
    <div v-for="(group, groupIndex) in groupedQuestions" :key="groupIndex" mb6>
      <div flex="~ wrap" gap6 justify="center">
        <Menu
          v-for="(question) in group"
          :key="question.id"
          :triggers="['hover']"
          :delay="{ show: 100, hide: 100 }"
          placement="bottom"
        >
          <div flex="~ col" gap2 w10 items-center>
            <span text="sm neutral-600" font-bold>{{ question.id }}</span>
            <button
              :ref="(el) => { if (el) questionRefs[question.id] = el as HTMLElement } "
              text-lg font-semibold border-2 rounded-lg size-10
              transition="all duration-200"
              :class="{
                'border-neutral-300 bg-white text-gray-700 hover:border-neutral-400': !question.value && currentQuestionId !== question.id,
                'border-teal-500 bg-teal-50 text-teal-600': question.value && currentQuestionId !== question.id,
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

          <template #popper>
            <div flex="~ wrap" p2 bg-white gap2 shadow-lg>
              <button
                v-for="option in options" :key="option"
                text="sm white"
                px1 rounded bg-teal-500 hover:bg-teal-600 transition="all duration-200"
                @click="handleOptionSelect(question.id, option)"
              >
                {{ option }}
              </button>
            </div>
          </template>
        </Menu>
      </div>
    </div>
  </div>
</template>
