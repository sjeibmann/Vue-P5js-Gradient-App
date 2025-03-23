import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ColorStop {
  id: number
  color: string
  position: number
}

export interface MeshNode {
  id: number
  row: number
  col: number
  x: number
  y: number
  color: string
  manuallyMoved?: boolean
}

export interface BlendSettings {
  smoothness: number // 0-1 range for transition sharpness
}

export const useGradientStore = defineStore('gradient', () => {
  const colorStops = ref<ColorStop[]>([
    { id: 1, color: '#ff0000', position: 0 },
    { id: 2, color: '#0000ff', position: 1 }
  ])
  
  const blendSettings = ref<BlendSettings>({
    smoothness: 0.5
  })

  // Mesh configuration
  const meshRows = ref(6)
  const meshColumns = ref(4)
  const meshVisibility = ref(true)
  const selectedNodeId = ref<number | null>(null)
  
  // Mesh nodes
  const meshNodes = ref<MeshNode[]>([])

  function addColorStop(color: string, position?: number) {
    const newId = Math.max(0, ...colorStops.value.map((stop: ColorStop) => stop.id)) + 1
    const newPosition = position ?? (colorStops.value.length > 0 
      ? Math.min(1, colorStops.value[colorStops.value.length - 1].position + 0.1)
      : 0.5)
    
    colorStops.value.push({
      id: newId,
      color,
      position: newPosition
    })
    
    // Sort by position
    colorStops.value.sort((a: ColorStop, b: ColorStop) => a.position - b.position)
  }
  
  function removeColorStop(id: number) {
    // Don't allow removing if we only have 2 or fewer stops
    if (colorStops.value.length <= 2) return
    
    const index = colorStops.value.findIndex((stop: ColorStop) => stop.id === id)
    if (index !== -1) {
      colorStops.value.splice(index, 1)
    }
  }
  
  function updateColorStop(id: number, updates: Partial<ColorStop>) {
    const stop = colorStops.value.find((stop: ColorStop) => stop.id === id)
    if (stop) {
      Object.assign(stop, updates)
      
      // If position was updated, re-sort the array
      if (updates.position !== undefined) {
        colorStops.value.sort((a: ColorStop, b: ColorStop) => a.position - b.position)
      }
    }
  }
  
  function updateBlendSettings(settings: Partial<BlendSettings>) {
    Object.assign(blendSettings.value, settings)
  }

  // Mesh control functions
  function setMeshRows(rows: number) {
    meshRows.value = rows
  }

  function setMeshColumns(columns: number) {
    meshColumns.value = columns
  }

  function toggleMeshVisibility() {
    meshVisibility.value = !meshVisibility.value
  }

  function selectNode(nodeId: number | null) {
    selectedNodeId.value = nodeId
  }

  // Mesh node management functions
  function addMeshNode(node: MeshNode) {
    meshNodes.value.push(node)
  }
  
  function updateMeshNode(id: number, updates: Partial<MeshNode>) {
    const node = meshNodes.value.find(node => node.id === id)
    if (node) {
      Object.assign(node, updates)
    }
  }
  
  function removeMeshNode(id: number) {
    const index = meshNodes.value.findIndex(node => node.id === id)
    if (index !== -1) {
      meshNodes.value.splice(index, 1)
    }
  }
  
  function clearMeshNodes() {
    meshNodes.value = []
  }

  return {
    colorStops,
    blendSettings,
    addColorStop,
    removeColorStop,
    updateColorStop,
    updateBlendSettings,
    meshRows,
    meshColumns,
    meshVisibility,
    selectedNodeId,
    setMeshRows,
    setMeshColumns,
    toggleMeshVisibility,
    selectNode,
    meshNodes,
    addMeshNode,
    updateMeshNode,
    removeMeshNode,
    clearMeshNodes
  }
})
