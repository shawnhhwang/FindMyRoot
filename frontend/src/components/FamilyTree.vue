<template>
  <div class="relative w-full h-[650px] bg-[#FAF8F5] border border-amber-900/20 rounded-2xl overflow-hidden shadow-inner flex flex-col select-none">
    <!-- Top Bar Controls -->
    <div class="bg-white/90 backdrop-blur-md px-5 py-3 border-b border-amber-900/10 flex flex-wrap items-center justify-between gap-3 z-10">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold text-amber-950 uppercase tracking-wider">世系開基始祖：</span>
        <select
          v-model="selectedRootId"
          @change="loadTree"
          class="text-xs font-serif bg-amber-50 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
        >
          <option v-for="r in roots" :key="r.id" :value="r.id">
            第 {{ r.generation_num }} 世：{{ r.last_name }}{{ r.first_name }} ({{ r.order_in_family || '開基祖' }})
          </option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="zoomIn"
          class="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-amber-50 text-xs shadow-sm"
          title="放大"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </button>
        <button
          @click="zoomOut"
          class="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-amber-50 text-xs shadow-sm"
          title="縮小"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
        </button>
        <button
          @click="resetZoom"
          class="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-amber-50 text-xs shadow-sm font-medium"
        >
          重置視角 ({{ Math.round(scale * 100) }}%)
        </button>
      </div>
    </div>

    <!-- Tree View Canvas Area -->
    <div
      ref="containerRef"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      class="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing p-8"
    >
      <div
        class="transition-transform duration-75 origin-top-left inline-block min-w-full"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }"
      >
        <div v-if="treeData" class="tree-root flex justify-center pt-4">
          <TreeNode
            :node="treeData"
            @select-person="handleSelectPerson"
            @create-tablet="handleCreateTablet"
          />
        </div>
        <div v-else class="text-center py-24 text-gray-400 font-serif">
          尚無世系圖資料
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../services/api.js';
import TreeNode from './TreeNode.vue';

const emit = defineEmits(['select-person', 'create-tablet']);

const roots = ref([]);
const selectedRootId = ref('');
const treeData = ref(null);

const scale = ref(1);
const panX = ref(100);
const panY = ref(40);
const isDragging = ref(false);
const dragStart = { x: 0, y: 0 };

async function loadRoots() {
  try {
    const res = await api.getTreeRoots();
    roots.value = res.data || [];
    if (roots.value.length > 0 && !selectedRootId.value) {
      selectedRootId.value = roots.value[0].id;
      loadTree();
    }
  } catch (err) {
    console.error('載入開基祖錯誤:', err);
  }
}

async function loadTree() {
  try {
    const res = await api.getFamilyTree(selectedRootId.value);
    treeData.value = res.data;
  } catch (err) {
    console.error('載入族譜樹錯誤:', err);
  }
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.15, 2.5);
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.15, 0.4);
}

function resetZoom() {
  scale.value = 1;
  panX.value = 100;
  panY.value = 40;
}

function startPan(e) {
  // 避免點擊按鈕時觸發拖曳
  if (e.target.closest('button')) return;
  isDragging.value = true;
  dragStart.x = e.clientX - panX.value;
  dragStart.y = e.clientY - panY.value;
}

function onPan(e) {
  if (!isDragging.value) return;
  panX.value = e.clientX - dragStart.x;
  panY.value = e.clientY - dragStart.y;
}

function endPan() {
  isDragging.value = false;
}

function handleSelectPerson(p) {
  emit('select-person', p);
}

function handleCreateTablet(p) {
  emit('create-tablet', p);
}

onMounted(() => {
  loadRoots();
});

defineExpose({
  reload: () => {
    loadRoots();
    loadTree();
  }
});
</script>

<style scoped>
.tree-root {
  min-width: max-content;
}
</style>
