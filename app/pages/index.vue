<script setup lang="ts">
const {
  initializeProfiles,
} = useProfiles()

const { activeTab, switchToPreviousTab, switchToNextTab, tabs } = useActiveTab()

const currentQuestionId = useCurrentQuestionId()
const shortcutsEnabled = useShortcutsEnabled()
const showShortcuts = useShowShortcuts()
const showSettings = useShowSettings()
const showImport = useShowImport()
const isInputing = useIsInputing()

const { currentProfile } = useProfiles()

function handleOptionSelect(questionIdOrOption: number | string, option?: string) {
  // Handle both cases:
  // - From AnswerList: handleOptionSelect(questionId, option)
  // - From Footer: handleOptionSelect(option)

  let questionId: number
  let selectedOption: string

  if (typeof questionIdOrOption === 'number') {
    // From AnswerList: first param is questionId, second is option
    questionId = questionIdOrOption
    selectedOption = option!
  }
  else {
    // From Footer: first param is option, use current question ID
    questionId = currentQuestionId.value
    selectedOption = questionIdOrOption
  }

  // Update user answer in current profile
  if (currentProfile.value && questionId > 0) {
    const answerIndex = currentProfile.value.userAnswers.findIndex(a => a.id === questionId)
    if (answerIndex !== -1) {
      currentProfile.value.userAnswers[answerIndex]!.value = selectedOption
    }
  }
}

// 键盘快捷键处理
function handleKeydown(event: KeyboardEvent) {
  if (isInputing.value)
    return

  // 空格键切换快捷键启用/禁用
  if (event.key === ' ') {
    shortcutsEnabled.value = !shortcutsEnabled.value
    event.preventDefault()
    return
  }

  // 如果快捷键被禁用，不处理其他按键
  if (!shortcutsEnabled.value)
    return

  const key = event.key.toLowerCase()

  // [ ] 切换标签页（在所有模式下都可用）
  if (key === '[') {
    // 切换到前一个标签页
    switchToPreviousTab()
    event.preventDefault()
  }
  else if (key === ']') {
    // 切换到下一个标签页
    switchToNextTab()
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
    currentQuestionId.value = Math.min(130, currentQuestionId.value + 1)
    event.preventDefault()
  }
  else if (key === 'j' || key === 'arrowdown') {
    // 下移 +5
    currentQuestionId.value = Math.min(130, currentQuestionId.value + 5)
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
    // Answer selection is now handled by individual components
    event.preventDefault()
  }

  // ? 切换帮助
  if (key === '?') {
    showShortcuts.value = !showShortcuts.value
    event.preventDefault()
  }

  // Ctrl+I 导入答案
  if (event.ctrlKey && key === 'i') {
    showImport.value = true
    event.preventDefault()
  }

  // backspace 删除答案或跳转到前一个题目
  if (key === 'backspace') {
    // Answer deletion is now handled by individual components
    // Just navigate to previous question
    currentQuestionId.value = Math.max(1, currentQuestionId.value - 1)
    event.preventDefault()
  }
}

onMounted(() => {
  initializeProfiles()
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
        <div flex="~" gap3 items-center max-sm:hidden>
          <h1 text="2xl neutral-800" font="bold">
            Answer Tracker
          </h1>
        </div>

        <!-- 常显进度统计 -->
        <Stats
          v-model:shortcuts-enabled="shortcutsEnabled"
          v-model:show-import="showImport"
          v-model:show-settings="showSettings"
        />
      </div>
    </header>

    <main p4 of-y-auto flex="~ col">
      <div rounded-lg bg-white shadow-sm relative of-auto grid="~ cols-1fr_min-content">
        <div border="b-1 neutral-200" bg-white>
          <button
            v-for="tab in tabs" :key="tab.id"
            flex1 font-medium p4 text-center border="b-2 transparent"
            :class="{ 'border-teal-500 text-teal-600': activeTab === tab.id, 'text-neutral-500': activeTab !== tab.id }"
            @click="() => activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div p4 of-y-auto>
          <AnswerList
            v-if="activeTab === 'answer' || activeTab === 'input'"
            v-model:current-question-id="currentQuestionId"
            @option-select="handleOptionSelect"
          />
          <DiffList v-else-if="activeTab === 'diff'" />
        </div>
      </div>
    </main>

    <Footer
      @update:current-question-id="(id) => currentQuestionId = id"
      @update:show-shortcuts="(show) => showShortcuts = show"
      @navigate-prev="currentQuestionId--"
      @navigate-next="currentQuestionId++"
      @option-select="handleOptionSelect"
    />

    <!-- 快捷键帮助模态框 -->
    <ShortcutsModal v-model:show="showShortcuts" />

    <!-- 设置模态框 -->
    <SettingsModal v-model:show="showSettings" />

    <!-- 导入答案模态框 -->
    <ImportModal
      :show="showImport"
      @close="showImport = false"
    />
  </div>
</template>
