import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ColorStep {
  id: number
  color: string
  position: number
}

export const useGradientStore = defineStore('gradient', () => {
  const colorSteps = ref<ColorStep[]>([
    { id: 1, color: '#ff0000', position: 0 },
    { id: 2, color: '#0000ff', position: 1 }
  ])

  function addColorStep(color: string) {
    const newId = Math.max(0, ...colorSteps.value.map((step: ColorStep) => step.id)) + 1
    const newPosition = colorSteps.value.length > 0 
      ? Math.min(1, colorSteps.value[colorSteps.value.length - 1].position + 0.1)
      : 0.5
    
    colorSteps.value.push({
      id: newId,
      color,
      position: newPosition
    })
    
    // Sort by position
    colorSteps.value.sort((a: ColorStep, b: ColorStep) => a.position - b.position)
  }
  
  function removeColorStep(id: number) {
    // Don't allow removing if we only have 2 or fewer steps
    if (colorSteps.value.length <= 2) return
    
    const index = colorSteps.value.findIndex((step: ColorStep) => step.id === id)
    if (index !== -1) {
      colorSteps.value.splice(index, 1)
    }
  }
  
  function updateColorStep(id: number, updates: Partial<ColorStep>) {
    const step = colorSteps.value.find((step: ColorStep) => step.id === id)
    if (step) {
      Object.assign(step, updates)
      
      // If position was updated, re-sort the array
      if (updates.position !== undefined) {
        colorSteps.value.sort((a: ColorStep, b: ColorStep) => a.position - b.position)
      }
    }
  }

  return {
    colorSteps,
    addColorStep,
    removeColorStep,
    updateColorStep
  }
})
