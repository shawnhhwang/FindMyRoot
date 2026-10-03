<template>
  <div class="relative w-full h-[700px] bg-[#FAF7F0] border-2 border-amber-900/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none">
    <!-- 頂部沉浸式控制儀表 (HUD Control Bar) -->
    <div class="bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-amber-900/15 flex flex-wrap items-center justify-between gap-4 z-20 shadow-sm font-serif">
      <!-- 始祖切換與當前宗支 -->
      <div class="flex items-center gap-3">
        <span class="cinnabar-seal text-xs px-2 py-0.5">源流</span>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-amber-950 uppercase tracking-wider">世系開基始祖：</span>
          <select
            v-model="selectedRootId"
            @change="loadTree"
            class="text-xs font-serif bg-amber-50/80 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold shadow-2xs"
          >
            <option v-for="r in roots" :key="r.id" :value="r.id">
              第 {{ r.generation_num }} 世：{{ r.last_name }}{{ r.first_name }} ({{ r.order_in_family || '開基祖' }})
            </option>
          </select>
        </div>
      </div>

      <!-- 族人名諱即時檢索高亮框 -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜尋先人姓名以高亮定位..."
            class="pl-8 pr-3 py-1.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans w-48 sm:w-56"
          />
          <svg class="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <!-- 視角縮放控制群 -->
      <div class="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border border-amber-200/60 text-xs">
        <button
          @click="zoomIn"
          class="p-1.5 bg-white border border-gray-200 hover:border-amber-400 rounded-lg text-gray-700 hover:text-amber-900 shadow-2xs transition-all"
          title="放大視角"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </button>
        <button
          @click="zoomOut"
          class="p-1.5 bg-white border border-gray-200 hover:border-amber-400 rounded-lg text-gray-700 hover:text-amber-900 shadow-2xs transition-all"
          title="縮小視角"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
        </button>
        <button
          @click="resetZoom"
          class="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-amber-400 rounded-lg text-gray-700 hover:text-amber-900 shadow-2xs font-medium font-sans text-xs transition-all"
        >
          {{ Math.round(scale * 100) }}% 重置
        </button>
      </div>
    </div>

    <!-- 族譜長卷畫布主體 (Silk Scroll / Rice Paper Canvas) -->
    <div
      ref="containerRef"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      class="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing p-10 bg-[#FAF7F0]"
    >
      <!-- 背景古雅宣紙水印與祥雲印記 -->
      <div class="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center font-serif text-[180px] font-black select-none text-amber-950">
        宗德綿長
      </div>

      <!-- 可平移與縮放的世系樹主體容器 -->
      <div
        class="transition-transform duration-75 origin-top-left inline-block min-w-full"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }"
      >
        <div v-if="treeData" class="tree-root flex justify-center pt-6">
          <TreeNode
            :node="treeData"
            :searchQuery="searchKeyword"
            @select-person="handleSelectPerson"
            @create-tablet="handleCreateTablet"
          />
        </div>
        <div v-else class="text-center py-36 text-gray-400 font-serif">
          尚無世系圖資料
        </div>
      </div>

      <!-- 畫布右下角長卷狀態徽章 -->
      <div class="absolute right-5 bottom-5 z-20 pointer-events-none bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-900/10 text-[11px] font-serif text-amber-900/80 shadow-sm flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>長卷世系圖譜 ‧ 支援自由平移與節點展開</span>
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
const searchKeyword = ref('');

const scale = ref(1);
const panX = ref(120);
const panY = ref(50);
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
  panX.value = 120;
  panY.value = 50;
}

function startPan(e) {
  if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
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
