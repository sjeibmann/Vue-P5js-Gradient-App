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

// Update mesh node color
const updateMeshNodeColor = (id: number, color: string) => {
  console.log(`Updating node ${id} color to ${color}`)
  if (id !== null) {
    gradientStore.updateMeshNode(id, { color })
  }
}

// Handle color picker change
const handleColorChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const color = target.value
  console.log(`Color picker changed to ${color}`)
  
  if (selectedNodeId.value !== null) {
    // Find the node directly in the array
    const nodeIndex = meshNodes.value.findIndex(node => node.id === selectedNodeId.value)
    if (nodeIndex !== -1) {
      // Update the node color directly
      meshNodes.value[nodeIndex].color = color
      console.log(`Updated node ${selectedNodeId.value} color to ${color} directly`)
    }
  }
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
  <div class="mesh-node-controls">
    <!-- Color Editor -->
    <div class="color-editor" @click.stop>
      <h3 class="editor-title">Node Color</h3>
      
      <div class="color-editor-content" :class="{ 'disabled': !isMeshNodeSelected }">
        <div class="color-selection" @click.stop>
          <div 
            class="color-preview-large" 
            :style="{ backgroundColor: selectedNodeColor }"
            @click.stop
          ></div>
          
          <div class="color-inputs">
            <input 
              type="color" 
              :value="selectedNodeColor" 
              @input="handleColorChange" 
              @click.stop
              class="color-picker-large"
              :disabled="!isMeshNodeSelected"
            />
            
            <input 
              type="text" 
              :value="selectedNodeColor" 
              @input="handleColorChange" 
              @click.stop
              class="color-text-input"
              :disabled="!isMeshNodeSelected"
              placeholder="Select a node"
              maxlength="7"
              pattern="#[0-9A-Fa-f]{6}"
            />
          </div>
        </div>
        
        <p class="selection-status" @click.stop>
          {{ isMeshNodeSelected ? `Node ${selectedNodeId} selected` : 'Select a node from the grid below' }}
        </p>
        
        <div v-if="isMeshNodeSelected" class="node-instructions" @click.stop>
          <p>Click and drag the node to adjust its position</p>
          <p>Use the color picker to change the node color</p>
        </div>
      </div>
    </div>
    
    <!-- Blend Settings -->
    <div class="blend-settings" @click.stop>
      <label>Blend Smoothness:</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        :value="blendSettings.smoothness" 
        @input="(e) => updateSmoothness(parseFloat((e.target as HTMLInputElement).value))"
        @click.stop
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
  </div>
</template>

<style scoped>
.mesh-node-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Color Editor */
.color-editor {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.color-editor-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.color-editor-content.disabled {
  opacity: 0.7;
}

.color-selection {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-preview-large {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.color-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-picker-large {
  width: 100%;
  height: 40px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.color-text-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
}

.selection-status {
  text-align: center;
  font-size: 0.9em;
  color: #666;
  margin: 5px 0 0 0;
}

.node-instructions {
  font-size: 0.9em;
  color: #666;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.node-instructions p {
  margin: 0 0 5px 0;
}

/* Titles */
.editor-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
}

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
</style>
