<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, inject } from 'vue'
import p5 from 'p5'
import { useWindowSize } from '@vueuse/core'
import mitt from 'mitt'
import { useGradientStore, type ColorStop, type MeshNode } from '@/stores/gradient'
import { storeToRefs } from 'pinia'

const canvasContainer = ref<HTMLElement | null>(null)
let p5Instance: p5 | null = null

// Get reactive window size
const { width, height } = useWindowSize()

// Get store
const gradientStore = useGradientStore()

// Get reactive store properties
const { colorStops, blendSettings, meshRows, meshColumns, meshVisibility, selectedNodeId, meshNodes } = storeToRefs(gradientStore)

// Track dragging state
let draggingNodeId: number | null = null

// Get the drawer interaction flag from the parent component
const isInteractingWithDrawer = inject('isInteractingWithDrawer', ref(false))

// Create a custom event bus for mesh node color updates
const emitter = mitt<{
  'update-mesh-node-color': { id: number; color: string }
}>()

// Listen for color update events
emitter.on('update-mesh-node-color', ({ id, color }) => {
  gradientStore.updateMeshNode(id, { color })
})

// Expose the emitter to the parent component
defineExpose({ 
  emitter
})

// Helper function to check if we're using WebGL mode
const isUsingWebGL = (): boolean => {
  return p5Instance?.drawingContext instanceof WebGLRenderingContext || false
}

// Initialize mesh nodes
const initializeMeshNodes = () => {
  // Clear existing nodes
  gradientStore.clearMeshNodes()
  
  const rows = meshRows.value
  const cols = meshColumns.value
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate normalized position (0-1)
      const normalizedX = col / (cols - 1)
      const normalizedY = row / (rows - 1)
      
      // Calculate actual pixel position
      let x = normalizedX * width.value
      let y = normalizedY * height.value
      
      // Generate a color based on position
      const color = getColorForPosition(normalizedX, normalizedY)
      
      gradientStore.addMeshNode({
        id: row * cols + col,
        row,
        col,
        x,
        y,
        color
      })
    }
  }
}

// Create a more efficient data structure for node lookup
const meshNodeGrid = computed(() => {
  const grid: (MeshNode | null)[][] = Array(meshRows.value)
    .fill(null)
    .map(() => Array(meshColumns.value).fill(null));
  
  for (const node of meshNodes.value) {
    if (node.row >= 0 && node.row < meshRows.value && 
        node.col >= 0 && node.col < meshColumns.value) {
      grid[node.row][node.col] = node;
    }
  }
  
  return grid;
});

// Get color for a position in the mesh using bilinear interpolation
const getColorForPosition = (normalizedX: number, normalizedY: number): string => {
  if (p5Instance === null) {
    // If p5Instance is not initialized, return a default color based on position
    const r = Math.floor(normalizedX * 255)
    const g = Math.floor(normalizedY * 255)
    const b = Math.floor((1 - normalizedX) * 255)
    return `rgb(${r}, ${g}, ${b})`
  }
  
  try {
    // Use both X and Y positions for 2D color interpolation
    const color = getInterpolatedColorForPosition(normalizedX, normalizedY, blendSettings.value.smoothness)
    
    // Convert p5.Color to hex string
    return `rgb(${p5Instance.red(color)}, ${p5Instance.green(color)}, ${p5Instance.blue(color)})`
  } catch (error) {
    // Fallback color if there's an error
    return `hsl(${normalizedX * 360}, 80%, 50%)`
  }
}

// Get interpolated color for a position using bilinear interpolation
const getInterpolatedColorForPosition = (normalizedX: number, normalizedY: number, smoothness: number): p5.Color => {
  if (p5Instance === null) throw new Error('P5 instance not initialized')
  const p = p5Instance
  
  // For moved nodes, use distance-based interpolation
  if (meshNodes.value.some(node => node.manuallyMoved)) {
    return getDistanceBasedColor(normalizedX, normalizedY, smoothness);
  }
  
  // For grid-aligned nodes, use bilinear interpolation
  // Find the grid cell that contains this position
  const cols = meshColumns.value - 1;
  const rows = meshRows.value - 1;
  
  const colFloat = normalizedX * cols;
  const rowFloat = normalizedY * rows;
  
  const col1 = Math.floor(colFloat);
  const col2 = Math.min(col1 + 1, cols);
  const row1 = Math.floor(rowFloat);
  const row2 = Math.min(row1 + 1, rows);
  
  // Get the four corners of the cell
  const grid = meshNodeGrid.value;
  const topLeft = grid[row1]?.[col1];
  const topRight = grid[row1]?.[col2];
  const bottomLeft = grid[row2]?.[col1];
  const bottomRight = grid[row2]?.[col2];
  
  if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
    // Fallback if any corner is missing
    return interpolateColors(colorStops.value, normalizedX, smoothness);
  }
  
  // Calculate interpolation factors with easing
  const tx = applyEasing(colFloat - col1, smoothness);
  const ty = applyEasing(rowFloat - row1, smoothness);
  
  // Bilinear interpolation
  // First interpolate the top and bottom edges
  const topColor = p.lerpColor(p.color(topLeft.color), p.color(topRight.color), tx);
  const bottomColor = p.lerpColor(p.color(bottomLeft.color), p.color(bottomRight.color), tx);
  
  // Then interpolate between top and bottom
  return p.lerpColor(topColor, bottomColor, ty);
}

// Get color based on distance to nearby nodes (for when nodes have been moved)
const getDistanceBasedColor = (normalizedX: number, normalizedY: number, smoothness: number): p5.Color => {
  if (p5Instance === null) throw new Error('P5 instance not initialized')
  const p = p5Instance
  
  // Convert normalized coordinates to actual pixel positions
  const x = normalizedX * width.value;
  const y = normalizedY * height.value;
  
  // Calculate weighted sum of colors based on inverse distance
  let totalWeight = 0;
  const weightedColors: {color: p5.Color, weight: number}[] = [];
  
  // Consider all nodes, with closer nodes having more influence
  for (const node of meshNodes.value) {
    const dx = x - node.x;
    const dy = y - node.y;
    const distanceSquared = dx * dx + dy * dy;
    
    // Avoid division by zero and limit maximum influence
    const minDistanceSquared = 100; // Minimum squared distance to avoid division by zero
    const effectiveDistanceSquared = Math.max(distanceSquared, minDistanceSquared);
    
    // Weight is inverse to distance squared
    const weight = 1 / effectiveDistanceSquared;
    totalWeight += weight;
    
    weightedColors.push({
      color: p.color(node.color),
      weight: weight
    });
  }
  
  // Sort by weight (highest first) and take only the most influential nodes
  weightedColors.sort((a, b) => b.weight - a.weight);
  const topInfluencers = weightedColors.slice(0, 4); // Consider only the 4 closest nodes
  
  // Recalculate total weight for the top influencers
  totalWeight = topInfluencers.reduce((sum, item) => sum + item.weight, 0);
  
  // Blend colors based on normalized weights
  let r = 0, g = 0, b = 0;
  for (const {color, weight} of topInfluencers) {
    const normalizedWeight = weight / totalWeight;
    r += p.red(color) * normalizedWeight;
    g += p.green(color) * normalizedWeight;
    b += p.blue(color) * normalizedWeight;
  }
  
  return p.color(r, g, b);
}

// Apply easing function based on smoothness parameter
const applyEasing = (t: number, smoothness: number): number => {
  // Linear interpolation when smoothness is 0.5
  if (Math.abs(smoothness - 0.5) < 0.01) return t;
  
  // Ease in when smoothness < 0.5 (sharper transitions)
  if (smoothness < 0.5) {
    const factor = 1 - smoothness * 2; // 0 to 1 as smoothness goes from 0.5 to 0
    return Math.pow(t, 1 + factor * 2); // Stronger ease-in for lower smoothness
  }
  
  // Ease out when smoothness > 0.5 (smoother transitions)
  const factor = (smoothness - 0.5) * 2; // 0 to 1 as smoothness goes from 0.5 to 1
  return 1 - Math.pow(1 - t, 1 + factor * 2); // Stronger ease-out for higher smoothness
}

// Helper function for color stops interpolation (used as fallback)
const interpolateColors = (colorStops: ColorStop[], t: number, smoothness: number): p5.Color => {
  if (p5Instance === null) throw new Error('P5 instance not initialized')
  const p = p5Instance
  
  // Find the two color stops that t falls between
  let start = colorStops[0]
  let end = colorStops[colorStops.length - 1]
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (t >= colorStops[i].position && t <= colorStops[i + 1].position) {
      start = colorStops[i]
      end = colorStops[i + 1]
      break
    }
  }
  
  // Normalize t to the range between these two stops
  const normalizedT = (t - start.position) / (end.position - start.position) || 0
  
  // Apply easing based on smoothness
  const easedT = applyEasing(normalizedT, smoothness)
  
  // Interpolate between the two colors
  return p.lerpColor(p.color(start.color), p.color(end.color), easedT)
}


// Configuration for gradient rendering
const renderConfig = ref({
  // Resolution multiplier for gradient rendering (higher = smoother gradients but lower performance)
  resolutionMultiplier: 8,
  // Use WebGL for hardware acceleration when available
  useWebGL: true
})

// P5.js sketch function
const sketch = (p: p5) => {
  p.setup = () => {
    // Try to use WebGL mode if enabled in config
    if (renderConfig.value.useWebGL) {
      try {
        p.createCanvas(width.value, height.value, p.WEBGL)
        console.log('Using WebGL renderer for hardware acceleration')
      } catch (e) {
        console.warn('WebGL not supported, falling back to 2D renderer', e)
        p.createCanvas(width.value, height.value)
      }
    } else {
      p.createCanvas(width.value, height.value)
    }
    
    // Position the camera to look at the center of the canvas from above
    p.camera(width.value/2, height.value/2, 800, width.value/2, height.value/2, 0, 0, 1, 0)

    p.colorMode(p.RGB)
    p.strokeWeight(2)
    
    // Initialize mesh nodes after p5 is set up
    // Use setTimeout to ensure the canvas is fully initialized
    setTimeout(() => {
      initializeMeshNodes()
    }, 0)
  }

  p.draw = () => {
    // Clear the background
    p.background(255)
    
    // Draw the mesh gradient
    drawMeshGradient(p)
    
    // Draw mesh grid and nodes if visibility is enabled
    if (meshVisibility.value) {
      drawMeshGrid(p)
      drawMeshNodes(p)
    }
  }
  
  // Draw the mesh gradient using a higher resolution grid for smoother transitions
  const drawMeshGradient = (p: p5) => {
    if (meshNodes.value.length < 4) return
    
    // Use the computed grid for faster node lookup
    const grid = meshNodeGrid.value;
    
    // Get the resolution multiplier for smoother gradients
    const resolution = renderConfig.value.resolutionMultiplier;
    
    // For each cell in the mesh grid (defined by 4 nodes)
    for (let row = 0; row < meshRows.value - 1; row++) {
      for (let col = 0; col < meshColumns.value - 1; col++) {
        // Get the 4 nodes that define this cell
        const topLeft = grid[row]?.[col];
        const topRight = grid[row]?.[col + 1];
        const bottomLeft = grid[row + 1]?.[col];
        const bottomRight = grid[row + 1]?.[col + 1];
        
        if (topLeft && topRight && bottomLeft && bottomRight) {
          // Create a higher resolution grid within this cell for smoother gradients
          drawSmoothGradientQuad(
            p, 
            topLeft, 
            topRight, 
            bottomLeft, 
            bottomRight, 
            resolution
          );
        }
      }
    }
  }
  
  // Draw a smooth gradient quad using a higher resolution grid
  const drawSmoothGradientQuad = (
    p: p5, 
    topLeft: MeshNode, 
    topRight: MeshNode, 
    bottomLeft: MeshNode, 
    bottomRight: MeshNode, 
    resolution: number
  ) => {
    p.noStroke();
    
    // Convert node colors to p5.Color objects
    const colorTopLeft = p.color(topLeft.color);
    const colorTopRight = p.color(topRight.color);
    const colorBottomLeft = p.color(bottomLeft.color);
    const colorBottomRight = p.color(bottomRight.color);
    
    // Create a higher resolution grid within this quad
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        // Calculate normalized positions within the quad (0-1)
        const tx1 = j / resolution;
        const ty1 = i / resolution;
        const tx2 = (j + 1) / resolution;
        const ty2 = i / resolution;
        const tx3 = j / resolution;
        const ty3 = (i + 1) / resolution;
        const tx4 = (j + 1) / resolution;
        const ty4 = (i + 1) / resolution;
        
        // Apply easing to the interpolation factors based on smoothness
        const easedTx1 = applyEasing(tx1, blendSettings.value.smoothness);
        const easedTy1 = applyEasing(ty1, blendSettings.value.smoothness);
        const easedTx2 = applyEasing(tx2, blendSettings.value.smoothness);
        const easedTy2 = applyEasing(ty2, blendSettings.value.smoothness);
        const easedTx3 = applyEasing(tx3, blendSettings.value.smoothness);
        const easedTy3 = applyEasing(ty3, blendSettings.value.smoothness);
        const easedTx4 = applyEasing(tx4, blendSettings.value.smoothness);
        const easedTy4 = applyEasing(ty4, blendSettings.value.smoothness);
        
        // Calculate the position of this sub-quad using the eased values
        // Interpolate between the four corners of the quad
        const x1 = p.lerp(
          p.lerp(topLeft.x, topRight.x, easedTx1),
          p.lerp(bottomLeft.x, bottomRight.x, easedTx1),
          easedTy1
        );
        const y1 = p.lerp(
          p.lerp(topLeft.y, topRight.y, easedTx1),
          p.lerp(bottomLeft.y, bottomRight.y, easedTx1),
          easedTy1
        );
        
        const x2 = p.lerp(
          p.lerp(topLeft.x, topRight.x, easedTx2),
          p.lerp(bottomLeft.x, bottomRight.x, easedTx2),
          easedTy2
        );
        const y2 = p.lerp(
          p.lerp(topLeft.y, topRight.y, easedTx2),
          p.lerp(bottomLeft.y, bottomRight.y, easedTx2),
          easedTy2
        );
        
        const x3 = p.lerp(
          p.lerp(topLeft.x, topRight.x, easedTx3),
          p.lerp(bottomLeft.x, bottomRight.x, easedTx3),
          easedTy3
        );
        const y3 = p.lerp(
          p.lerp(topLeft.y, topRight.y, easedTx3),
          p.lerp(bottomLeft.y, bottomRight.y, easedTx3),
          easedTy3
        );
        
        const x4 = p.lerp(
          p.lerp(topLeft.x, topRight.x, easedTx4),
          p.lerp(bottomLeft.x, bottomRight.x, easedTx4),
          easedTy4
        );
        const y4 = p.lerp(
          p.lerp(topLeft.y, topRight.y, easedTx4),
          p.lerp(bottomLeft.y, bottomRight.y, easedTx4),
          easedTy4
        );
        
        // Calculate the colors at each corner of this sub-quad using the same easing
        const c1 = bilinearInterpolate(
          tx1, 
          ty1, 
          colorTopLeft, 
          colorTopRight, 
          colorBottomLeft, 
          colorBottomRight,
          blendSettings.value.smoothness
        );
        
        const c2 = bilinearInterpolate(
          tx2, 
          ty2, 
          colorTopLeft, 
          colorTopRight, 
          colorBottomLeft, 
          colorBottomRight,
          blendSettings.value.smoothness
        );
        
        const c3 = bilinearInterpolate(
          tx3, 
          ty3, 
          colorTopLeft, 
          colorTopRight, 
          colorBottomLeft, 
          colorBottomRight,
          blendSettings.value.smoothness
        );
        
        const c4 = bilinearInterpolate(
          tx4, 
          ty4, 
          colorTopLeft, 
          colorTopRight, 
          colorBottomLeft, 
          colorBottomRight,
          blendSettings.value.smoothness
        );
        
        // Draw the first triangle of this sub-quad
        p.beginShape(p.TRIANGLES);
        p.fill(c1);
        p.vertex(x1, y1);
        p.fill(c3);
        p.vertex(x3, y3);
        p.fill(c2);
        p.vertex(x2, y2);
        p.endShape();
        
        // Draw the second triangle of this sub-quad
        p.beginShape(p.TRIANGLES);
        p.fill(c3);
        p.vertex(x3, y3);
        p.fill(c4);
        p.vertex(x4, y4);
        p.fill(c2);
        p.vertex(x2, y2);
        p.endShape();
      }
    }
  }
  
  // Bilinear interpolation for smooth color blending
  const bilinearInterpolate = (
    tx: number, 
    ty: number, 
    colorTopLeft: p5.Color, 
    colorTopRight: p5.Color, 
    colorBottomLeft: p5.Color, 
    colorBottomRight: p5.Color,
    smoothness: number
  ): p5.Color => {
    // Apply easing to the interpolation factors
    const easedTx = applyEasing(tx, smoothness);
    const easedTy = applyEasing(ty, smoothness);
    
    // Interpolate along the top and bottom edges
    const colorTop = p.lerpColor(colorTopLeft, colorTopRight, easedTx);
    const colorBottom = p.lerpColor(colorBottomLeft, colorBottomRight, easedTx);
    
    // Interpolate between top and bottom
    return p.lerpColor(colorTop, colorBottom, easedTy);
  }
  
  
  const drawMeshGrid = (p: p5) => {
    p.stroke(200)
    p.strokeWeight(1)
    
    // Use the computed grid for faster node lookup
    const grid = meshNodeGrid.value;
    
    // Draw horizontal grid lines
    for (let row = 0; row < meshRows.value; row++) {
      p.beginShape()
      p.noFill
      for (let col = 0; col < meshColumns.value; col++) {
        const node = grid[row]?.[col];
        if (node) {
          p.vertex(node.x, node.y)
        }
      }
      p.endShape()
    }
    
    // Draw vertical grid lines
    for (let col = 0; col < meshColumns.value; col++) {
      p.beginShape()
      p.noFill
      for (let row = 0; row < meshRows.value; row++) {
        const node = grid[row]?.[col];
        if (node) {
          p.vertex(node.x, node.y)
        }
      }
      p.endShape()
    }
  }
  
  const drawMeshNodes = (p: p5) => {
    p.strokeWeight(1)
    
    for (const node of meshNodes.value) {
      // Draw node
      p.stroke(0)
      // Check if this node is the selected node
      const isSelected = node.id === selectedNodeId.value
      p.fill(isSelected ? p.color(255, 0, 0) : p.color(node.color))
      p.circle(node.x, node.y, 10)
    }
  }
  
  
  // Mobile touch support
  p.touchStarted = () => {
    p.mousePressed()
    return false // Prevent default touch behavior
  }

  p.touchMoved = () => {
    p.mouseDragged()
    return false // Prevent default touch behavior
  }

  p.touchEnded = () => {
    p.mouseReleased()
    return false // Prevent default touch behavior
  }

  // Helper function to get mouse coordinates that work with the camera setup
  const getAdjustedMouseCoords = () => {
    // With the camera() function, mouse coordinates work directly in WebGL mode
    // No adjustment needed as the camera is positioned to maintain the coordinate system
    return {
      x: p.mouseX,
      y: p.mouseY
    }
  }

  p.mousePressed = (event?: MouseEvent) => {
    // Check if the click is on a color picker or other drawer element
    if (event && event.target) {
      const target = event.target as HTMLElement
      if (target && (
        target.classList.contains('color-picker-large') || 
        target.classList.contains('color-text-input') ||
        target.classList.contains('color-preview-large') ||
        target.closest('.drawer-open')
      )) {
        console.log('Ignoring canvas click because it was on a drawer element', target)
        return
      }
    }
    
    // If interacting with drawer, don't process the click
    if (isInteractingWithDrawer.value) {
      console.log('Ignoring canvas click because drawer is being interacted with')
      return
    }
    
    // Get adjusted mouse coordinates
    const { x: mouseX, y: mouseY } = getAdjustedMouseCoords()
    
    // Check if mouse is over a mesh node
    for (const node of meshNodes.value) {
      const d = p.dist(mouseX, mouseY, node.x, node.y)
      if (d < 10) {
        gradientStore.selectNode(node.id)
        draggingNodeId = node.id
        return
      }
    }
    
    // If no node was clicked, deselect
    gradientStore.selectNode(null)
    draggingNodeId = null
  }
  
  p.mouseDragged = () => {
    // Move the selected mesh node
    if (draggingNodeId !== null) {
      // Get adjusted mouse coordinates
      const { x: mouseX, y: mouseY } = getAdjustedMouseCoords()
      
      gradientStore.updateMeshNode(draggingNodeId, {
        x: mouseX,
        y: mouseY,
        manuallyMoved: true
      })
    }
  }
  
  p.mouseReleased = () => {
    draggingNodeId = null
  }

  p.windowResized = () => {
    // Resize the canvas
    p.resizeCanvas(width.value, height.value)
    
    // Reset the camera position for the new canvas size
    if (p.drawingContext instanceof WebGLRenderingContext) {
      p.camera(width.value/2, height.value/2, 800, width.value/2, height.value/2, 0, 0, 1, 0)
    }
    
    // Recalculate mesh node positions on resize
    for (const node of meshNodes.value) {
      const normalizedX = node.col / (meshColumns.value - 1)
      const normalizedY = node.row / (meshRows.value - 1)
      
      // Only update position if it hasn't been manually moved
      if (!node.manuallyMoved) {
        gradientStore.updateMeshNode(node.id, {
          x: normalizedX * width.value,
          y: normalizedY * height.value
        })
      }
    }
  }
}

// Watch for changes in mesh configuration
watch([meshRows, meshColumns], () => {
  initializeMeshNodes()
})

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
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
