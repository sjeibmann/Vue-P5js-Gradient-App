<script setup lang="ts">
import { ref } from 'vue'
import { useGradientStore } from '@/stores/gradient'
import { storeToRefs } from 'pinia'

// Get store
const gradientStore = useGradientStore()
const { meshRows, meshColumns, meshVisibility, selectedNodeId } = storeToRefs(gradientStore)

// Update mesh rows
const updateMeshRows = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  if (!isNaN(value) && value >= 2 && value <= 20) {
    gradientStore.setMeshRows(value)
  }
}

// Update mesh columns
const updateMeshColumns = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  if (!isNaN(value) && value >= 2 && value <= 20) {
    gradientStore.setMeshColumns(value)
  }
}

// Toggle mesh visibility
const toggleMeshVisibility = () => {
  gradientStore.toggleMeshVisibility()
}
</script>

<template>
  <div class="mesh-controls">
    <h3>Gradient Mesh</h3>
    
    <div class="mesh-grid-controls">
      <div class="input-group">
        <label for="mesh-rows">Rows:</label>
        <input 
          id="mesh-rows" 
          type="number" 
          min="2" 
          max="20" 
          :value="meshRows" 
          @change="updateMeshRows"
        />
      </div>
      
      <div class="input-group">
        <label for="mesh-columns">Columns:</label>
        <input 
          id="mesh-columns" 
          type="number" 
          min="2" 
          max="20" 
          :value="meshColumns" 
          @change="updateMeshColumns"
        />
      </div>
    </div>
    
    <div class="mesh-visibility">
      <label for="mesh-visibility">Show Mesh:</label>
      <input 
        id="mesh-visibility" 
        type="checkbox" 
        :checked="meshVisibility" 
        @change="toggleMeshVisibility"
      />
    </div>
    
    <div class="selected-node-info" v-if="selectedNodeId !== null">
      <h4>Selected Node: {{ selectedNodeId }}</h4>
      <p>Click on a node in the mesh to select it and change its color.</p>
      <p>Drag nodes to adjust their positions.</p>
    </div>
    
    <div class="instructions" v-else>
      <p>Click on a node in the mesh to select it.</p>
      <p>The mesh allows you to create complex gradient patterns by adjusting node colors and positions.</p>
    </div>
  </div>
</template>

<style scoped>
.mesh-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 15px 0;
}

.mesh-grid-controls {
  display: flex;
  gap: 15px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group input {
  width: 60px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.mesh-visibility {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mesh-visibility input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.selected-node-info {
  margin-top: 10px;
  padding: 12px;
  background-color: #e8f5e9;
  border-radius: 4px;
}

.selected-node-info h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #2e7d32;
}

.selected-node-info p {
  margin: 0 0 8px 0;
  font-size: 0.9em;
}

.instructions {
  margin-top: 10px;
  padding: 12px;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.9em;
}

.instructions p {
  margin: 0 0 8px 0;
}

.instructions p:last-child {
  margin-bottom: 0;
}
</style>
