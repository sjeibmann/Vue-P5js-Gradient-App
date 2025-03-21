<script setup lang="ts">
import { computed } from 'vue'
import ColorControls from './ColorControls.vue'
import AnimationControls from './AnimationControls.vue'

// Props
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

// Computed
const drawerClass = computed(() => ({
  'drawer': true,
  'drawer-open': props.isOpen
}))
</script>

<template>
  <div :class="drawerClass">
    <div class="drawer-content">
      <h2 class="drawer-title">Gradient Controls</h2>
      
      <div class="drawer-section">
        <h3>Colors</h3>
        <ColorControls />
      </div>
      
      <div class="drawer-section">
        <h3>Animation</h3>
        <AnimationControls />
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
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
