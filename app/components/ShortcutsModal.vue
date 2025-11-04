<script setup lang="ts">
const show = defineModel<boolean>('show', { default: false })
</script>

<template>
  <Modal
    :show="show"
    title="快捷键帮助"
    @close="show = false"
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
</template>