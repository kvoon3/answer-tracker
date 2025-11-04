export function useActiveTab() {
  const activeTab = useState<'answer' | 'input' | 'diff'>('activeTab', () => 'answer')

  const tabs = [
    { id: 'answer' as const, name: '用户答案' },
    { id: 'input' as const, name: '标准答案' },
    { id: 'diff' as const, name: '对比' },
  ]

  function switchToPreviousTab() {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    const prevTab = tabs[prevIndex]
    if (prevTab)
      activeTab.value = prevTab.id
  }

  function switchToNextTab() {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    const nextTab = tabs[nextIndex]
    if (nextTab)
      activeTab.value = nextTab.id
  }

  return {
    activeTab,
    tabs,
    switchToPreviousTab,
    switchToNextTab,
  }
}
