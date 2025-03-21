<script setup lang="ts">
import { ref } from 'vue'
import GradientCanvas from '@/components/gradient/GradientCanvas.vue'
import Drawer from '@/components/ui/Drawer.vue'

const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>

<template>
  <div class="main-view">
    <GradientCanvas />
    <button 
      class="drawer-toggle" 
      @click="toggleDrawer" 
      :class="{ 'drawer-open': isDrawerOpen }"
    >
      <span class="toggle-icon">{{ isDrawerOpen ? '›' : '‹' }}</span>
    </button>
    <Drawer :is-open="isDrawerOpen" />
  </div>
</template>

<style scoped>
.main-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
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
  right: 320px;
}

.toggle-icon {
  font-size: 24px;
  color: white;
}
</style>
