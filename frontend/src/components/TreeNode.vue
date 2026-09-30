<template>
  <div class="tree-node-wrapper flex flex-col items-center">
    <!-- 成員卡片 -->
    <div
      class="group relative bg-white border-2 rounded-xl p-3 shadow-md hover:shadow-xl transition-all w-60 z-10 flex flex-col"
      :class="[
        node.gender === 'M' ? 'border-amber-700/60' : 'border-rose-400',
        node.isDeceased ? 'bg-amber-50/20' : 'bg-white'
      ]"
    >
      <!-- 頂部世數與排行標籤 -->
      <div class="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-gray-100">
        <span class="font-bold text-amber-950 font-serif bg-amber-100/80 px-2 py-0.5 rounded">
          第 {{ node.generation_num }} 世
          <span v-if="node.generation_name">「{{ node.generation_name }}」字輩</span>
        </span>
        <span class="text-gray-500 font-medium">
          {{ node.order_in_family || (node.gender === 'M' ? '男子' : '女子') }}
        </span>
      </div>

      <!-- 姓名主體 -->
      <div class="flex items-center justify-between my-1">
        <div class="flex items-center gap-1.5">
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="node.gender === 'M' ? 'bg-amber-700' : 'bg-rose-500'"
          ></span>
          <span class="font-serif font-bold text-base text-gray-900 tracking-wider">
            {{ node.name }}
          </span>
          <span v-if="node.courtesy_name" class="text-xs text-gray-500">
            ({{ node.courtesy_name }})
          </span>
        </div>
        <span
          v-if="node.isDeceased"
          class="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-serif"
        >
          已故
        </span>
        <span
          v-else
          class="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-serif"
        >
          健在
        </span>
      </div>

      <!-- 配偶列表 -->
      <div v-if="node.spouses && node.spouses.length" class="mt-1 pt-1.5 border-t border-dashed border-gray-200 text-xs text-gray-600 flex items-center gap-1 flex-wrap">
        <span class="text-[11px] font-medium text-rose-700">配：</span>
        <span
          v-for="sp in node.spouses"
          :key="sp.id"
          class="bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded text-[11px]"
        >
          {{ sp.name }}
        </span>
      </div>

      <!-- 生卒資訊簡述 -->
      <div class="text-[11px] text-gray-500 mt-2 space-y-0.5 font-mono">
        <div v-if="node.lunar_birth_date" class="truncate" :title="node.lunar_birth_date">
          生：{{ node.lunar_birth_date }} {{ node.birth_time_branch ? node.birth_time_branch + '時' : '' }}
        </div>
        <div v-else-if="node.solar_birth_date">
          生：西元 {{ node.solar_birth_date }}
        </div>
        <div v-if="node.lunar_death_date" class="truncate text-stone-500" :title="node.lunar_death_date">
          卒：{{ node.lunar_death_date }} {{ node.death_time_branch ? node.death_time_branch + '時' : '' }}
        </div>
      </div>

      <!-- 操作捷徑 -->
      <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <button
          @click.stop="$emit('select-person', node)"
          class="text-amber-800 hover:text-amber-950 font-medium hover:underline text-[11px]"
        >
          檔案詳情
        </button>
        <button
          @click.stop="$emit('create-tablet', node)"
          class="bg-amber-900/10 text-amber-900 hover:bg-amber-900 hover:text-white px-2 py-0.5 rounded text-[11px] font-serif transition-colors"
        >
          牌位排版
        </button>
      </div>

      <!-- 展開收合子孫節點按鈕 -->
      <button
        v-if="node.children && node.children.length"
        @click.stop="isCollapsed = !isCollapsed"
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs shadow hover:bg-amber-900 transition-colors z-20"
        :title="isCollapsed ? '展開世系分支' : '收合世系分支'"
      >
        <span class="font-bold font-mono">{{ isCollapsed ? '+' : '-' }}</span>
      </button>
    </div>

    <!-- 子世系分支連線與節點 -->
    <div
      v-if="node.children && node.children.length && !isCollapsed"
      class="children-container flex justify-center pt-8 relative"
    >
      <!-- 母線向下的垂直連線 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-amber-800/40"></div>

      <!-- 子女並排容器 -->
      <div class="flex items-start">
        <div
          v-for="(child, idx) in node.children"
          :key="child.id"
          class="child-wrapper relative px-5"
        >
          <!-- 橫向連接導線 -->
          <div
            v-if="node.children.length > 1"
            class="absolute top-0 h-0.5 bg-amber-800/40"
            :class="{
              'left-1/2 right-0': idx === 0,
              'left-0 right-1/2': idx === node.children.length - 1,
              'left-0 right-0': idx > 0 && idx < node.children.length - 1
            }"
          ></div>

          <!-- 子節點垂直引線 -->
          <div class="w-0.5 h-6 bg-amber-800/40 mx-auto -mt-6"></div>

          <!-- 遞迴子元件 -->
          <TreeNode
            :node="child"
            @select-person="$emit('select-person', $event)"
            @create-tablet="$emit('create-tablet', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  node: { type: Object, required: true }
});

defineEmits(['select-person', 'create-tablet']);

const isCollapsed = ref(false);
</script>

<style scoped>
.tree-node-wrapper {
  position: relative;
}
</style>
