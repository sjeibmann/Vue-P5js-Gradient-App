import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AnimationPattern = 'sine' | 'cosine' | 'linear'

export const useAnimationStore = defineStore('animation', () => {
  const speed = ref<number>(0.01)
  const pattern = ref<AnimationPattern>('sine')

  function updateSpeed(newSpeed: number) {
    speed.value = newSpeed
  }

  function updatePattern(newPattern: AnimationPattern) {
    pattern.value = newPattern
  }

  return {
    speed,
    pattern,
    updateSpeed,
    updatePattern
  }
})
