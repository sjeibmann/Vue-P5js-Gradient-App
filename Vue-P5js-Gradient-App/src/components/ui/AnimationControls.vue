<script setup lang="ts">
import { ref } from 'vue'
import { useAnimationStore, type AnimationPattern } from '@/stores/animation'
import { storeToRefs } from 'pinia'

// Get store
const animationStore = useAnimationStore()
const { speed, pattern } = storeToRefs(animationStore)

// Update animation speed
const updateSpeed = (newSpeed: number) => {
  animationStore.updateSpeed(newSpeed)
}

// Update animation pattern
const updatePattern = (newPattern: AnimationPattern) => {
  animationStore.updatePattern(newPattern)
}

// Animation patterns
const patterns: { value: AnimationPattern; label: string }[] = [
  { value: 'sine', label: 'Sine Wave' },
  { value: 'cosine', label: 'Cosine Wave' },
  { value: 'linear', label: 'Linear' }
]
</script>

<template>
  <div class="animation-controls">
    <div class="control-group">
      <label for="speed-slider">Animation Speed</label>
      <div class="slider-container">
        <input 
          id="speed-slider"
          type="range" 
          min="0.001" 
          max="0.05" 
          step="0.001" 
          :value="speed" 
          @input="(e) => updateSpeed(parseFloat((e.target as HTMLInputElement).value))" 
          class="speed-slider"
        />
        <span class="speed-value">{{ (speed * 1000).toFixed(0) }}</span>
      </div>
    </div>
    
    <div class="control-group">
      <label>Animation Pattern</label>
      <div class="pattern-options">
        <div 
          v-for="opt in patterns" 
          :key="opt.value" 
          class="pattern-option"
          :class="{ 'selected': pattern === opt.value }"
          @click="updatePattern(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #555;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-slider {
  flex: 1;
}

.speed-value {
  min-width: 30px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.pattern-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pattern-option {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pattern-option:hover {
  background-color: #e0e0e0;
}

.pattern-option.selected {
  background-color: #2196f3;
  color: white;
}
</style>
