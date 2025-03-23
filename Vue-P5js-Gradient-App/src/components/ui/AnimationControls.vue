<script setup lang="ts">
import { ref } from 'vue'
import { useAnimationStore, type AnimationPattern, type EasingFunction } from '@/stores/animation'
import { storeToRefs } from 'pinia'

// Get store
const animationStore = useAnimationStore()
const { speed, pattern, easing, isPlaying } = storeToRefs(animationStore)

// Update animation speed
const updateSpeed = (newSpeed: number) => {
  animationStore.updateSpeed(newSpeed)
}

// Update animation pattern
const updatePattern = (newPattern: AnimationPattern) => {
  animationStore.updatePattern(newPattern)
}

// Update easing function
const updateEasing = (newEasing: EasingFunction) => {
  animationStore.updateEasing(newEasing)
}

// Toggle animation playback
const togglePlayback = () => {
  animationStore.togglePlayback()
}

// Animation patterns
const patterns: { value: AnimationPattern; label: string }[] = [
  { value: 'sine', label: 'Sine Wave' },
  { value: 'cosine', label: 'Cosine Wave' },
  { value: 'linear', label: 'Linear' }
]

// Easing functions
const easingFunctions: { value: EasingFunction; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' }
]
</script>

<template>
  <div class="animation-controls">
    <div class="playback-control">
      <button 
        @click="togglePlayback" 
        class="playback-button"
        :class="{ 'playing': isPlaying }"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
    
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
    
    <div class="control-group">
      <label>Easing Function</label>
      <div class="easing-options">
        <div 
          v-for="opt in easingFunctions" 
          :key="opt.value" 
          class="easing-option"
          :class="{ 'selected': easing === opt.value }"
          @click="updateEasing(opt.value)"
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

.pattern-option.selected,
.easing-option.selected {
  background-color: #2196f3;
  color: white;
}

.easing-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.easing-option {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.easing-option:hover {
  background-color: #e0e0e0;
}

.playback-control {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.playback-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #4caf50;
  color: white;
  width: 100px;
}

.playback-button.playing {
  background-color: #f44336;
}

.playback-button:hover {
  opacity: 0.9;
}
</style>
