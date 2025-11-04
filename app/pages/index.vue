<script setup lang="ts">
import AnswerList from '~/components/AnswerList.vue'
import ImportModal from '~/components/ImportModal.vue'
import Modal from '~/components/Modal.vue'
import { useProfiles } from '~/composables/useProfiles'

const {
  profiles,
  currentProfile,
  createProfile,
  switchProfile,
  deleteProfile,
  editProfileName,
  initializeProfiles,
} = useProfiles()

const activeTab = ref<'answer' | 'input' | 'diff'>('answer')
const currentQuestionId = ref<number>(0)
const showShortcuts = ref(false)
const showSettings = ref(false)
const showImport = ref(false)

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

const isInputing = ref(false)
const shortcutsEnabled = ref(true)

// Profile management state
const activeSettingsTab = ref<'general' | 'profiles'>('general')
const newProfileName = ref('')
const editingProfileId = ref<string | null>(null)
const editingProfileName = ref('')

const tabs = [
  { id: 'answer' as const, name: '用户答案' },
  { id: 'input' as const, name: '标准答案' },
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

function handleImport(answers: (string | undefined)[], type: 'user' | 'standard') {
  const targetArray = type === 'user' ? userAnswer.value : answer.value

  // Update answers
  answers.forEach((answerValue, index) => {
    const questionId = index + 1
    const answerItem = targetArray.find(q => q.id === questionId)
    if (answerItem) {
      answerItem.value = answerValue || undefined
    }
  })
}

onMounted(() => {
  initializeProfiles()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Profile management functions
function handleCreateProfile() {
  if (newProfileName.value.trim()) {
    createProfile(newProfileName.value.trim(), questionCount.value)
    newProfileName.value = ''
  }
}

function handleSwitchProfile(profileId: string) {
  switchProfile(profileId)
}

function handleDeleteProfile(profileId: string) {
  // eslint-disable-next-line no-alert
  if (confirm('确定要删除这个档案吗？此操作无法撤销。')) {
    deleteProfile(profileId)
  }
}

function startEditProfile(profileId: string, currentName: string) {
  editingProfileId.value = profileId
  editingProfileName.value = currentName
}

function saveEditProfile() {
  if (editingProfileId.value && editingProfileName.value.trim()) {
    editProfileName(editingProfileId.value, editingProfileName.value.trim())
    editingProfileId.value = null
    editingProfileName.value = ''
  }
}

function cancelEditProfile() {
  editingProfileId.value = null
  editingProfileName.value = ''
}
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
      </div>
    </header>

    <main p4 of-y-auto flex="~ col">
      <div rounded-lg bg-white shadow-sm relative of-auto grid="~ cols-1fr_min-content">
        <div border="b-1 neutral-200" bg-white>
          <button
            v-for="tab in tabs" :key="tab.id"
            flex1 font-medium p4 text-center border="b-2 transparent"
            :class="{ 'border-teal-500 text-teal-600': activeTab === tab.id, 'text-neutral-500': activeTab !== tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div p4 of-y-auto>
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
          text="xs neutral-500" border="1 neutral-300 rounded" p="x-3 y-1" bg-white right-12 absolute max-lg:hidden hover="bg-neutral-50"
          @click="showShortcuts = true"
        >
          快捷键帮助 (按 ?)
        </button>
      </div>
    </footer>

    <!-- 快捷键帮助模态框 -->
    <Modal
      :show="showShortcuts"
      title="快捷键帮助"
      @close="showShortcuts = false"
    >
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
              <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>space</kbd>
              <span text="neutral-600">切换快捷键启用/禁用</span>
            </div>
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
            <div flex="~" gap2 items-center>
              <kbd border="1 neutral-300 rounded" text-xs px2 py1 bg-neutral-50>?</kbd>
              <span text="neutral-600">显示/隐藏此帮助窗口</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 设置模态框 -->
    <Modal
      :show="showSettings"
      title="设置"
      @close="showSettings = false"
    >
      <div space-y-4>
        <!-- Settings Tabs -->
        <div flex="~" border="b-1 neutral-200">
          <button
            v-for="tab in [{ id: 'general', name: '常规' }, { id: 'profiles', name: '档案管理' }] as const"
            :key="tab.id"
            flex1 font-medium p4 text-center border="b-2 transparent"
            :class="{ 'border-teal-500 text-teal-600': activeSettingsTab === tab.id, 'text-neutral-500': activeSettingsTab !== tab.id }"
            @click="activeSettingsTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- General Settings -->
        <div v-if="activeSettingsTab === 'general'" space-y-4>
          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              题目数量设置
            </h3>
            <div flex="~ wrap" gap4 items="center">
              <input
                v-model.number="questionCount"
                type="number"
                min="1"
                max="100" border="1 neutral-300 rounded"
                p="x-3 y-2" text-center
                bg-white w32 @focus="() => {
                  isInputing = true
                }"
              >
              <span text="neutral-600">道题目</span>
            </div>
          </div>
        </div>

        <!-- Profile Management -->
        <div v-if="activeSettingsTab === 'profiles'" space-y-4>
          <!-- Current Profile -->
          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              当前档案
            </h3>
            <div v-if="currentProfile" bg="neutral-50" border="1 neutral-200 rounded" p4>
              <div flex="~" items-center justify-between>
                <div>
                  <div text="neutral-800" font-semibold>
                    {{ currentProfile.name }}
                  </div>
                  <div text="xs neutral-500">
                    创建时间：{{ new Date(currentProfile.createTime).toLocaleString() }}
                  </div>
                  <div text="xs neutral-500">
                    题目数量：{{ currentProfile.questionCount }}
                  </div>
                </div>
                <div text="sm teal-600" font-semibold>
                  当前使用
                </div>
              </div>
            </div>
            <div v-else text="neutral-500" italic>
              暂无档案
            </div>
          </div>

          <!-- Create New Profile -->
          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              新建档案
            </h3>
            <div flex="~" gap2>
              <input
                v-model="newProfileName"
                type="text"
                placeholder="输入档案名称"
                border="1 neutral-300 rounded"
                p="x-3 y-2" flex1
                bg-white
                @keydown.enter="handleCreateProfile"
              >
              <button
                bg="teal-500"
                text="white" font-semibold rounded-lg p="x-4 y-2"
                hover:bg-teal-600 :disabled="!newProfileName.trim()"
                @click="handleCreateProfile"
              >
                创建
              </button>
            </div>
          </div>

          <!-- Profile List -->
          <div>
            <h3 text="lg neutral-700" font-semibold mb-2>
              档案列表
            </h3>
            <div max-h-60 of-y-auto space-y-2>
              <div
                v-for="profile in Object.values(profiles)"
                :key="profile.id"
                bg="neutral-50" border="1 neutral-200 rounded" p3
                :class="{ 'border-teal-500 bg-teal-50': currentProfile?.id === profile.id }"
              >
                <div flex="~" items-center justify-between>
                  <div flex="~" gap3 items-center>
                    <!-- Profile Name Editing -->
                    <div v-if="editingProfileId === profile.id">
                      <input
                        v-model="editingProfileName"
                        type="text"
                        border="1 neutral-300 rounded"
                        p="x-2 y-1" text-sm
                        bg-white
                        @keydown.enter="saveEditProfile"
                        @keydown.esc="cancelEditProfile"
                      >
                    </div>
                    <div v-else>
                      <div text="neutral-800" font-semibold>
                        {{ profile.name }}
                      </div>
                      <div text="xs neutral-500">
                        {{ new Date(profile.createTime).toLocaleString() }}
                      </div>
                    </div>
                  </div>

                  <div flex="~" gap2>
                    <!-- Edit/Save/Cancel Buttons -->
                    <div v-if="editingProfileId === profile.id">
                      <button
                        text="xs teal-600"
                        border="1 teal-600 rounded" p="x-2 y-1"
                        hover:text-white hover:bg-teal-600 @click="saveEditProfile"
                      >
                        保存
                      </button>
                      <button
                        text="xs neutral-600"
                        border="1 neutral-300 rounded" p="x-2 y-1"
                        ml2 hover:bg-neutral-200 @click="cancelEditProfile"
                      >
                        取消
                      </button>
                    </div>
                    <div v-else>
                      <!-- Switch Button -->
                      <button
                        v-if="currentProfile?.id !== profile.id"
                        text="xs teal-600"
                        border="1 teal-600 rounded" p="x-2 y-1"
                        hover:text-white hover:bg-teal-600 @click="handleSwitchProfile(profile.id)"
                      >
                        切换
                      </button>

                      <!-- Edit Button -->
                      <button
                        text="xs neutral-600"
                        border="1 neutral-300 rounded" p="x-2 y-1"
                        ml2 hover:bg-neutral-200 @click="startEditProfile(profile.id, profile.name)"
                      >
                        编辑
                      </button>

                      <!-- Delete Button -->
                      <button
                        text="xs red-600"
                        border="1 red-600 rounded" p="x-2 y-1"
                        ml2 hover:text-white hover:bg-red-600 @click="handleDeleteProfile(profile.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 导入答案模态框 -->
    <ImportModal
      :show="showImport"
      @close="showImport = false"
      @import="handleImport"
    />
  </div>
</template>
