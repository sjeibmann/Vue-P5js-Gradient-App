<script setup lang="ts">
import { ref } from 'vue'
import { useGradientStore, type ColorStep } from '@/stores/gradient'
import { storeToRefs } from 'pinia'

// Get store
const gradientStore = useGradientStore()
const { colorSteps } = storeToRefs(gradientStore)

// Add a new color step
const addColorStep = () => {
  gradientStore.addColorStep('#00ff00') // Default to green
}

// Remove a color step
const removeColorStep = (id: number) => {
  gradientStore.removeColorStep(id)
}

// Update a color step
const updateColor = (id: number, color: string) => {
  gradientStore.updateColorStep(id, { color })
}

// Update position
const updatePosition = (id: number, position: number) => {
  gradientStore.updateColorStep(id, { position })
}
</script>

<template>
  <div class="color-controls">
    <div 
      v-for="step in colorSteps" 
      :key="step.id" 
      class="color-step"
    >
      <div class="color-preview" :style="{ backgroundColor: step.color }"></div>
      <input 
        type="color" 
        :value="step.color" 
        @input="(e) => updateColor(step.id, (e.target as HTMLInputElement).value)" 
        class="color-picker"
      />
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        :value="step.position" 
        @input="(e) => updatePosition(step.id, parseFloat((e.target as HTMLInputElement).value))" 
        class="position-slider"
      />
      <button 
        @click="removeColorStep(step.id)" 
        class="remove-button"
        :disabled="colorSteps.length <= 2"
      >
        ✕
      </button>
    </div>
    
    <button @click="addColorStep" class="add-button">
      Add Color
    </button>
  </div>
</template>

<style scoped>
.color-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.color-step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.color-picker {
  width: 40px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.position-slider {
  flex: 1;
}

.remove-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: #f44336;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover {
  background-color: #45a049;
}
</style>
