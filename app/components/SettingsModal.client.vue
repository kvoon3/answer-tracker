<script setup lang="ts">
import { useProfiles } from '~/composables/useProfiles'

const show = defineModel<boolean>('show', { default: false })

const {
  profiles,
  currentProfile,
  createProfile,
  switchProfile,
  deleteProfile,
  editProfileName,
} = useProfiles()

const activeSettingsTab = ref<'general' | 'profiles'>('general')
const newProfileName = ref('')
const editingProfileId = ref<string | null>(null)
const editingProfileName = ref('')

// Direct references to current profile data
const questionCount = computed({
  get: () => currentProfile.value?.questionCount || 130,
  set: (value) => {
    if (currentProfile.value) {
      currentProfile.value.questionCount = value
    }
  },
})

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
  <Modal
    :show="show"
    title="设置"
    @close="show = false"
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
              bg-white w32
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
</template>