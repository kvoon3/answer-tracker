<script setup lang="ts">
const options = ['A', 'B', 'C', 'D']

const emit = defineEmits<{
  'update:currentQuestionId': [id: number]
  'update:showShortcuts': [show: boolean]
  'optionSelect': [option: string]
  'navigatePrev': []
  'navigateNext': []
}>()

function handleOptionSelect(option: string) {
  emit('optionSelect', option)
}

function navigatePrev() {
  emit('navigatePrev')
}

function navigateNext() {
  emit('navigateNext')
}

function showShortcutsHelp() {
  emit('update:showShortcuts', true)
}
</script>

<template>
  <footer border="t-1 neutral-200" p4 bg-white shadow-lg bottom-0 sticky>
    <div flex="~ wrap" gap3 items-center justify-center>
      <button
        @click="navigatePrev"
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
      <button @click="navigateNext">
        Next
      </button>
      <button
        text="xs neutral-500" border="1 neutral-300 rounded" p="x-3 y-1" bg-white right-12 absolute max-lg:hidden hover="bg-neutral-50"
        @click="showShortcutsHelp"
      >
        快捷键帮助 (按 ?)
      </button>
    </div>
  </footer>
</template>
