<script setup lang="ts">
import { computed } from 'vue'
import MeshNodeControls from './MeshNodeControls.vue'
import MeshControls from './MeshControls.vue'
import { useGradientStore } from '@/stores/gradient'

// Get store
const gradientStore = useGradientStore()

// Props
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['mousedown', 'mouseup', 'mouseleave'])

// Handle mouse events
const handleMouseDown = (e: MouseEvent) => {
  emit('mousedown', e)
  e.stopPropagation()
}

const handleMouseUp = (e: MouseEvent) => {
  emit('mouseup', e)
  e.stopPropagation()
}

const handleMouseLeave = (e: MouseEvent) => {
  emit('mouseleave', e)
  e.stopPropagation()
}

// Computed
const drawerClass = computed(() => ({
  'drawer': true,
  'drawer-open': props.isOpen
}))
</script>

<template>
  <div 
    :class="drawerClass" 
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <div 
      class="drawer-content" 
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    >
      <h2 class="drawer-title">Gradient Controls</h2>
      
      <div class="drawer-section">
        <MeshNodeControls />
      </div>
      
      <div class="drawer-section">
        <MeshControls />
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  transition: right 0.3s ease;
  z-index: 5;
  overflow-y: auto;
}

.drawer-open {
  right: 0;
}

.drawer-content {
  padding: 20px;
}

.drawer-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

.drawer-section {
  margin-bottom: 30px;
}

.drawer-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #555;
}
</style>
