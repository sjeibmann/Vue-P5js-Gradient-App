<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGradientStore, type ColorStop, type BlendSettings, type MeshNode } from '@/stores/gradient'
import { storeToRefs } from 'pinia'

// Get store
const gradientStore = useGradientStore()
const { colorStops, blendSettings, selectedNodeId, meshNodes, meshRows, meshColumns } = storeToRefs(gradientStore)

// Computed property to check if a mesh node is selected
const isMeshNodeSelected = computed(() => selectedNodeId.value !== null)

// Get the color of the selected node
const selectedNodeColor = computed(() => {
  if (!selectedNodeId.value) return '#ff0000'
  
  const selectedNode = meshNodes.value.find(node => node.id === selectedNodeId.value)
  return selectedNode?.color || '#ff0000'
})

// Add a new color stop
const addColorStop = () => {
  gradientStore.addColorStop('#00ff00') // Default to green
}

// Remove a color stop
const removeColorStop = (id: number) => {
  gradientStore.removeColorStop(id)
}

// Update a color stop
const updateColor = (id: number, color: string) => {
  gradientStore.updateColorStop(id, { color })
}

// Update mesh node color
const updateMeshNodeColor = (id: number, color: string) => {
  gradientStore.updateMeshNode(id, { color })
}

// Update position
const updatePosition = (id: number, position: number) => {
  gradientStore.updateColorStop(id, { position })
}

// Update blend smoothness
const updateSmoothness = (smoothness: number) => {
  gradientStore.updateBlendSettings({ smoothness })
}

// Format node position for display
const formatNodePosition = (node: MeshNode) => {
  return `Row: ${node.row}, Col: ${node.col}`
}

// Computed property for grid template
const gridTemplateStyle = computed(() => {
  return {
    gridTemplateRows: `repeat(${meshRows.value}, 1fr)`,
    gridTemplateColumns: `repeat(${meshColumns.value}, 1fr)`
  }
})
</script>

<template>
  <div class="color-controls">
    <!-- Selected Node Editor -->
    <div v-if="isMeshNodeSelected" class="mesh-node-editor">
      <div class="mesh-node-header">
        <h4>Selected Node: {{ selectedNodeId }}</h4>
        <p>Edit the selected node's color:</p>
      </div>
      
      <div class="mesh-node-color">
        <div class="color-preview" :style="{ backgroundColor: selectedNodeColor }"></div>
        <input 
          type="color" 
          :value="selectedNodeColor" 
          @input="(e) => updateMeshNodeColor(selectedNodeId, (e.target as HTMLInputElement).value)" 
          class="node-color-picker"
        />
        <div class="node-instructions">
          <p>Click and drag the node to adjust its position</p>
          <p>Use the color picker to change the node color</p>
        </div>
      </div>
    </div>
    
    <!-- Blend Settings -->
    <div class="blend-settings">
      <label>Blend Smoothness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        :value="blendSettings.smoothness" 
        @input="(e) => updateSmoothness(parseFloat((e.target as HTMLInputElement).value))" 
        class="smoothness-slider"
      />
      <span>{{ Math.round(blendSettings.smoothness * 100) }}%</span>
    </div>
    
    <!-- Mesh Nodes Grid -->
    <h3 class="section-title">Mesh Node Grid</h3>
    <div class="mesh-grid-container" :style="gridTemplateStyle">
      <div 
        v-for="node in meshNodes" 
        :key="node.id"
        class="mesh-node-cell"
        :class="{ 'selected': node.id === selectedNodeId, 'manually-moved': node.manuallyMoved }"
        :style="{ gridRow: node.row + 1, gridColumn: node.col + 1 }"
        @click="gradientStore.selectNode(node.id)"
        :title="`Node ${node.id} (${formatNodePosition(node)})`"
      >
        <div class="mesh-node-color" :style="{ backgroundColor: node.color }"></div>
      </div>
    </div>
    
    <!-- Color Stops section removed as requested -->
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

.mesh-node-editor {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.mesh-node-header h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #2e7d32;
}

.mesh-node-header p {
  /* margin: 0 0 10px 0; */
  font-size: 0.9em;
}

.mesh-node-color {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-color-picker {
  width: 60px;
  height: 30px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.node-instructions {
  font-size: 0.9em;
  color: #666;
  margin-left: 10px;
}

.node-instructions p {
  margin: 0 0 5px 0;
}

/* Section Titles */
.section-title {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 1.1rem;
  color: #333;
}

.mesh-grid-container {
  display: grid;
  gap: 8px;
  margin: 15px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  max-width: 100%;
  overflow: auto;
}

.mesh-node-cell {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.mesh-node-cell:hover {
  transform: scale(1.1);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.mesh-node-cell.selected {
  border: 2px solid #2196F3;
  z-index: 3;
}

.mesh-node-cell.manually-moved::after {
  content: "•";
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 14px;
  color: #FF5722;
}

.mesh-node-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
}

/* Blend Settings */
.blend-settings {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.smoothness-slider {
  flex: 1;
  margin: 0 10px;
}

/* Position Value */
.position-value {
  min-width: 40px;
  text-align: right;
  font-size: 0.9em;
  color: #666;
}
</style>
