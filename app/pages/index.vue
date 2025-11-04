<script setup lang="ts">
import type { Answer } from '~/types'
import AnswerList from '~/components/AnswerList.vue'

const questionCount = ref(130)
const activeTab = ref<'answer' | 'input' | 'diff'>('answer')
const userAnswer = ref<Answer[]>([])
const answer = ref<Answer[]>([])
const currentQuestionId = ref<number>(0)
const showShortcuts = ref(false)

const tabs = [
  { id: 'answer' as const, name: '答题' },
  { id: 'input' as const, name: '录入答案' },
  { id: 'diff' as const, name: '对比' },
]

const options = ['A', 'B', 'C', 'D']

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

// 键盘快捷键处理
function handleKeydown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()

  // [ ] 切换标签页（在所有模式下都可用）
  if (key === '[') {
    // 切换到前一个标签页
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    const prevTab = tabs[prevIndex]
    if (prevTab)
      activeTab.value = prevTab.id
    event.preventDefault()
  }
  else if (key === ']') {
    // 切换到下一个标签页
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    const nextTab = tabs[nextIndex]
    if (nextTab)
      activeTab.value = nextTab.id
    event.preventDefault()
  }

  // 只在答题和录入答案模式下处理其他快捷键
  if (activeTab.value === 'diff')
    return

  // hjkl 和方向键导航
  if (key === 'h' || key === 'arrowleft') {
    // 左移 -1
    currentQuestionId.value = Math.max(1, currentQuestionId.value - 1)
    event.preventDefault()
  }
  else if (key === 'l' || key === 'arrowright') {
    // 右移 +1
    currentQuestionId.value = Math.min(questionCount.value, currentQuestionId.value + 1)
    event.preventDefault()
  }
  else if (key === 'j' || key === 'arrowdown') {
    // 下移 +5
    currentQuestionId.value = Math.min(questionCount.value, currentQuestionId.value + 5)
    event.preventDefault()
  }
  else if (key === 'k' || key === 'arrowup') {
    // 上移 -5
    currentQuestionId.value = Math.max(1, currentQuestionId.value - 5)
    event.preventDefault()
  }

  // abcd/1234 作答
  const answerKeys = ['a', 'b', 'c', 'd', '1', '2', '3', '4']
  if (answerKeys.includes(key)) {
    let answerValue = key
    if (['1', '2', '3', '4'].includes(key)) {
      answerValue = ['a', 'b', 'c', 'd'][Number.parseInt(key) - 1] || 'a'
    }
    handleOptionSelect(answerValue.toUpperCase())
    event.preventDefault()
  }

  // backspace 删除答案或跳转到前一个题目
  if (key === 'backspace') {
    const currentAnswer = userAnswer.value.find(q => q.id === currentQuestionId.value)
    if (currentAnswer?.value) {
      // 删除当前答案
      currentAnswer.value = undefined
    }
    else {
      // 跳转到前一个题目
      currentQuestionId.value = Math.max(1, currentQuestionId.value - 1)
    }
    event.preventDefault()
  }
}

onMounted(() => {
  initializeQuestions()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div grid="~ rows-[min-content_1fr_min-content]" text-neutral-500 bg-neutral-50 h-screen relative>
    <header p4 bg-white shadow-sm>
      <div flex="~" items-center justify-between>
        <div flex="~" gap3 items-center>
          <h1 text="2xl neutral-800" font="bold" max-sm:hidden>
            Answer Tracker
          </h1>
        </div>

        <!-- 常显进度统计 -->
        <div flex="~ wrap" gap4 items-center md:gap6 text="sm">
          <!-- 已做 -->
          <div flex="~" gap2 items-center>
            <Icon name="ph:check-circle" size="18" text="green-600" />
            <span max-sm:hidden text="neutral-600">已做：</span>
            <span text="green-600" font-semibold>{{ answeredCount }}</span>
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
            <Icon name="ph:check" size="18" text="green-600" />
            <span max-sm:hidden text="neutral-600">正确：</span>
            <span text="green-600" font-semibold>{{ correctCount }}</span>
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
                'text-green-600': accuracyRate >= 80,
                'text-yellow-600': accuracyRate >= 60 && accuracyRate < 80,
                'text-red-600': accuracyRate < 60,
              }"
            />
            <span max-sm:hidden text="neutral-600">准确率：</span>
            <span
              :class="{
                'text-green-600': accuracyRate >= 80,
                'text-yellow-600': accuracyRate >= 60 && accuracyRate < 80,
                'text-red-600': accuracyRate < 60,
              }"
              font-semibold
            >
              {{ accuracyRate }}%
            </span>
          </div>
        </div>
      </div>
    </header>

    <main p4 of-y-auto flex="~ col">
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

      <div rounded-lg bg-white shadow-sm relative of-auto>
        <div border="b-1 neutral-200" bg-white top-0 sticky>
          <button
            v-for="tab in tabs" :key="tab.id"
            flex1 font-medium p4 text-center border="b-2 transparent"
            :class="{ 'border-teal-500 text-teal-600': activeTab === tab.id, 'text-neutral-500': activeTab !== tab.id }"
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

    <footer v-if="activeTab !== 'diff'" border="t-1 neutral-200" p4 bg-white shadow-lg bottom-0 sticky space-y-2>
      <div flex="~ wrap" gap3 items-center justify-center>
        <button
          @click="currentQuestionId--"
        >
          Prev
        </button>
        <button
          v-for="option in options" :key="option"
          text="white lg" font-semibold rounded-lg bg-teal-500 size-8 transition="all duration-200" hover="bg-teal-600 scale-105" active="scale-95"
          @click="handleOptionSelect(option)"
        >
          {{ option }}
        </button>
        <button @click="currentQuestionId++">
          Next
        </button>
        <button
          text="xs neutral-500" border="1 neutral-300 rounded" p="x-3 y-1" bg-white max-lg:hidden right-12 absolute hover="bg-neutral-50"
          @click="showShortcuts = true"
        >
          快捷键帮助
        </button>
      </div>
    </footer>

    <!-- 快捷键帮助模态框 -->
    <div
      v-if="showShortcuts"
      bg="black/50" flex items-center inset-0 justify-center fixed z-50
      @click="showShortcuts = false"
    >
      <div
        mx-4 p-6 rounded-lg bg-white max-w-md w-full shadow-lg
        @click.stop
      >
        <div flex="~" mb-4 items-center justify-between>
          <h2 text="xl neutral-800" font-semibold>
            快捷键帮助
          </h2>
          <button
            text="lg neutral-500 hover:neutral-700"
            @click="showShortcuts = false"
          >
            ×
          </button>
        </div>

        <div space-y-4>
          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              导航
            </h3>
            <div grid="~ cols-2" text-sm gap2>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>h</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>←</kbd>
                <span text="neutral-600">左移 -1</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>l</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>→</kbd>
                <span text="neutral-600">右移 +1</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>j</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>↓</kbd>
                <span text="neutral-600">下移 +5</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>k</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>↑</kbd>
                <span text="neutral-600">上移 -5</span>
              </div>
            </div>
          </div>

          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              作答
            </h3>
            <div grid="~ cols-2" text-sm gap2>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>a</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>1</kbd>
                <span text="neutral-600">选择 A</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>b</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>2</kbd>
                <span text="neutral-600">选择 B</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>c</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>3</kbd>
                <span text="neutral-600">选择 C</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>d</kbd>
                <span text="neutral-600">或</span>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>4</kbd>
                <span text="neutral-600">选择 D</span>
              </div>
            </div>
          </div>

          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              其他
            </h3>
            <div text-sm space-y-2>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>backspace</kbd>
                <span text="neutral-600">删除当前答案，或跳转到前一个题目</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>[</kbd>
                <span text="neutral-600">切换到前一个标签页</span>
              </div>
              <div flex="~" gap2 items-center>
                <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>]</kbd>
                <span text="neutral-600">切换到下一个标签页</span>
              </div>
            </div>
          </div>
        </div>

        <div mt-6 pt-4 border="t-1 neutral-200" text-center>
          <button
            text="teal-600 hover:teal-700"
            @click="showShortcuts = false"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
