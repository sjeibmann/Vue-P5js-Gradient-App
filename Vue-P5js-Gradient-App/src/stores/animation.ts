import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AnimationPattern = 'sine' | 'cosine' | 'linear'
export type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

export const useAnimationStore = defineStore('animation', () => {
  const speed = ref<number>(0.01)
  const pattern = ref<AnimationPattern>('sine')
  const easing = ref<EasingFunction>('linear')
  const isPlaying = ref<boolean>(true)

  function updateSpeed(newSpeed: number) {
    speed.value = newSpeed
  }

  function updatePattern(newPattern: AnimationPattern) {
    pattern.value = newPattern
  }
  
  function updateEasing(newEasing: EasingFunction) {
    easing.value = newEasing
  }
  
  function togglePlayback() {
    isPlaying.value = !isPlaying.value
  }
  
  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  return {
    speed,
    pattern,
    easing,
    isPlaying,
    updateSpeed,
    updatePattern,
    updateEasing,
    togglePlayback,
    setPlaying
  }
})
