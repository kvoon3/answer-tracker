<script setup lang="ts">
interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  import: [answers: string[], type: 'user' | 'standard']
}>()

const activeTab = ref<'user' | 'standard'>('user')
const inputText = ref('')
const parsedCount = ref(0)
const errorMessage = ref('')

function handleClose() {
  emit('close')
  inputText.value = ''
  errorMessage.value = ''
  parsedCount.value = 0
}

// ESC key handler
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    handleClose()
    event.preventDefault()
  }
}

function parseAnswers(text: string): string[] {
  // Use regex to find all A, B, C, D, or * characters
  const matches = text.match(/[ABCD*]/gi)
  if (!matches) return []

  // Convert to uppercase and handle * as undefined (empty)
  return matches.map(match =>
    match.toUpperCase() === '*' ? undefined : match.toUpperCase()
  )
}

function handleParse() {
  if (!inputText.value.trim()) {
    errorMessage.value = '请输入答案文本'
    parsedCount.value = 0
    return
  }

  const answers = parseAnswers(inputText.value)
  parsedCount.value = answers.length

  if (answers.length === 0) {
    errorMessage.value = '未找到有效的答案 (A, B, C, D 或 *)'
  } else {
    errorMessage.value = ''
  }
}

function handleImport() {
  const answers = parseAnswers(inputText.value)
  if (answers.length > 0) {
    emit('import', answers, activeTab.value)
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="show"
    bg="black/50" flex items-center inset-0 justify-center fixed z-50
    @click="handleClose"
  >
    <div
      mx-4 p-6 rounded-lg bg-white max-w-2xl w-full shadow-lg
      @click.stop
    >
      <div flex="~" mb-4 items-center justify-between>
        <h2 text="xl neutral-800" font-semibold>
          导入答案
        </h2>
        <button
          text="lg neutral-500 hover:neutral-700"
          @click="handleClose"
        >
          ×
        </button>
      </div>

      <!-- Tab Navigation -->
      <div flex="~" mb-4 border="b-1 neutral-200">
        <button
          flex-1 py-2 text-center border-b-2 transition-colors
          :class="[
            activeTab === 'user'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          ]"
          @click="activeTab = 'user'"
        >
          用户答案
        </button>
        <button
          flex-1 py-2 text-center border-b-2 transition-colors
          :class="[
            activeTab === 'standard'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          ]"
          @click="activeTab = 'standard'"
        >
          标准答案
        </button>
      </div>

      <!-- Input Area -->
      <div>
        <label for="answer-input" block mb-2 text="sm neutral-700" font-medium>
          粘贴答案文本 (支持 A, B, C, D 或 * 表示留空)
        </label>
        <textarea
          id="answer-input"
          v-model="inputText"
          rows="10"
          w-full p-3 border rounded-lg resize-vertical
          :class="[
            errorMessage ? 'border-red-300 focus:border-red-500' : 'border-neutral-300 focus:border-teal-500'
          ]"
          placeholder="例如：
1. A
2. B
3. C
4. *
5. D

或者：
A B C * D A B C D A B C D A B C D

* 表示该题留空"
          @input="handleParse"
        />

        <!-- Error Message -->
        <div v-if="errorMessage" mt-2 text="sm red-600">
          {{ errorMessage }}
        </div>

        <!-- Parse Result -->
        <div v-if="parsedCount > 0 && !errorMessage" mt-2 text="sm teal-600">
          已解析 {{ parsedCount }} 个答案
        </div>
      </div>

      <!-- Action Buttons -->
      <div mt-6 pt-4 border="t-1 neutral-200" flex="~" justify-end gap-3>
        <button
          px-4 py-2 border rounded-lg transition-colors
          border-neutral-300 text-neutral-700 hover:bg-neutral-50
          @click="handleClose"
        >
          取消
        </button>
        <button
          px-4 py-2 border rounded-lg transition-colors
          :class="[
            parsedCount > 0
              ? 'bg-teal-500 border-teal-500 text-white hover:bg-teal-600'
              : 'bg-neutral-300 border-neutral-300 text-neutral-500 cursor-not-allowed'
          ]"
          :disabled="parsedCount === 0"
          @click="handleImport"
        >
          导入
        </button>
      </div>
    </div>
  </div>
</template>