<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import p5 from 'p5'
import { useWindowSize } from '@vueuse/core'
import { useGradientStore } from '@/stores/gradient'
import { useAnimationStore } from '@/stores/animation'

const canvasContainer = ref<HTMLElement | null>(null)
let p5Instance: p5 | null = null

// Get reactive window size
const { width, height } = useWindowSize()

// Get stores
const gradientStore = useGradientStore()
const animationStore = useAnimationStore()

// P5.js sketch function
const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(width.value, height.value)
    p.colorMode(p.HSB, 360, 100, 100)
    p.noStroke()
  }

  p.draw = () => {
    // Simple gradient for now - will be enhanced in later phases
    const color1 = p.color('#ff0000') // Red
    const color2 = p.color('#0000ff') // Blue
    
    for (let y = 0; y < p.height; y++) {
      const inter = y / p.height
      const c = p.lerpColor(color1, color2, inter)
      p.stroke(c)
      p.line(0, y, p.width, y)
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(width.value, height.value)
  }
}

onMounted(() => {
  if (canvasContainer.value) {
    p5Instance = new p5(sketch, canvasContainer.value)
  }
})

onUnmounted(() => {
  if (p5Instance) {
    p5Instance.remove()
  }
})
</script>

<template>
  <div ref="canvasContainer" class="canvas-container"></div>
</template>

<style scoped>
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
