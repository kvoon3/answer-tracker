<script setup lang="ts">
interface Props {
  show: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}

// ESC key handler
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    handleClose()
    event.preventDefault()
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
      mx-4 p-6 rounded-lg bg-white max-w-md w-full shadow-lg
      @click.stop
    >
      <div flex="~" mb-4 items-center justify-between>
        <h2 text="xl neutral-800" font-semibold>
          {{ title }}
        </h2>
        <button
          text="lg neutral-500 hover:neutral-700"
          @click="handleClose"
        >
          ×
        </button>
      </div>

      <slot />

      <div mt-6 pt-4 border="t-1 neutral-200" text-center>
        <button
          text="teal-600 hover:teal-700"
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
