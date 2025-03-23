<script setup lang="ts">
import { ref, provide } from 'vue'
import GradientCanvas from '@/components/gradient/GradientCanvas.vue'
import Drawer from '@/components/ui/Drawer.vue'

const isDrawerOpen = ref(false)
const canvasRef = ref<InstanceType<typeof GradientCanvas> | null>(null)
const isInteractingWithDrawer = ref(false)

// Provide this flag to child components
provide('isInteractingWithDrawer', isInteractingWithDrawer)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

// Function to set the interaction flag
const setDrawerInteraction = (value: boolean) => {
  isInteractingWithDrawer.value = value
  console.log('Drawer interaction:', value)
}
</script>

<template>
  <div class="main-view">
    <GradientCanvas ref="canvasRef" />
    <button 
      class="drawer-toggle" 
      @click="toggleDrawer" 
      :class="{ 'drawer-open': isDrawerOpen }"
    >
      <span class="toggle-icon">{{ isDrawerOpen ? '›' : '‹' }}</span>
    </button>
    <Drawer 
      :is-open="isDrawerOpen"
      @mousedown="setDrawerInteraction(true)"
      @mouseup="setDrawerInteraction(false)"
      @mouseleave="setDrawerInteraction(false)"
    />
  </div>
</template>

<style scoped>
.main-view {
  position: relative;
  width: 100%;
  height: 100vh;
  /* overflow: hidden; */
}

.drawer-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 16px 8px;
  cursor: pointer;
  transition: right 0.3s ease;
}

.drawer-toggle.drawer-open {
  right: 360px;
}

.toggle-icon {
  font-size: 24px;
  color: white;
}
</style>
