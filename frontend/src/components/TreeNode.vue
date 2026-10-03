<template>
  <div class="tree-node-wrapper flex flex-col items-center">
    <!-- 典藏級成員木牘 / 金絲卡片 -->
    <div
      class="group relative bg-[#FCFAF5] border rounded-2xl p-3.5 shadow-paper hover:shadow-paper-elevated transition-all duration-300 w-64 z-10 flex flex-col cursor-pointer"
      :class="[
        node.gender === 'M' ? 'border-[#B8860B]/40 hover:border-[#D4AF37]' : 'border-rose-400/50 hover:border-rose-500',
        node.isDeceased ? 'bg-gradient-to-b from-[#FCFAF5] to-[#F5EFE4]' : 'bg-[#FFFFFD]',
        isHighlighted ? 'ring-4 ring-amber-400/80 shadow-gold-glow scale-105 border-amber-600' : ''
      ]"
      @click="$emit('select-person', node)"
    >
      <!-- 頂部古典世數徽章與行次 -->
      <div class="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-amber-900/10">
        <div class="flex items-center gap-1.5">
          <span class="cinnabar-seal text-[10px] px-1.5 py-0.2">
            第 {{ toChineseNumeral(node.generation_num) }} 世
          </span>
          <span v-if="node.generation_name" class="font-serif font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.2 rounded text-[11px]">
            「{{ node.generation_name }}」字輩
          </span>
        </div>
        <span class="text-amber-900/70 font-serif text-[11px]">
          {{ node.order_in_family || (node.gender === 'M' ? '乾道' : '坤道') }}
        </span>
      </div>

      <!-- 姓名主體與字號 -->
      <div class="flex items-center justify-between my-0.5">
        <div class="flex items-center gap-2">
          <!-- 宗族性別乾坤太極標記 -->
          <span
            class="w-2.5 h-2.5 rounded-full ring-2"
            :class="node.gender === 'M' ? 'bg-[#9E6F28] ring-amber-200' : 'bg-[#B84A5B] ring-rose-200'"
          ></span>
          <span class="font-serif font-black text-lg tracking-wider text-gray-950 group-hover:text-amber-950 transition-colors">
            {{ node.name }}
          </span>
          <span v-if="node.courtesy_name" class="text-xs text-stone-500 font-serif">
            ({{ node.courtesy_name }})
          </span>
        </div>

        <span
          v-if="node.isDeceased"
          class="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded-full font-serif font-medium"
        >
          仙逝
        </span>
        <span
          v-else
          class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-serif font-semibold"
        >
          健在
        </span>
      </div>

      <!-- 配偶關聯 (結髮連理標記) -->
      <div v-if="node.spouses && node.spouses.length" class="mt-1.5 pt-1.5 border-t border-dashed border-amber-900/10 text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
        <span class="text-[10px] text-rose-800 font-bold bg-rose-100/60 px-1 rounded">配偶</span>
        <span
          v-for="sp in node.spouses"
          :key="sp.id"
          class="bg-rose-50/80 border border-rose-200 text-rose-900 px-2 py-0.5 rounded text-[11px] font-serif"
        >
          {{ sp.name }}
        </span>
      </div>

      <!-- 生卒資訊簡述 (干支時辰對照) -->
      <div class="text-[11px] text-stone-600 mt-2 space-y-0.5 font-mono">
        <div v-if="node.lunar_birth_date" class="truncate" :title="node.lunar_birth_date">
          生：{{ node.lunar_birth_date }} {{ node.birth_time_branch ? node.birth_time_branch + '時' : '' }}
        </div>
        <div v-else-if="node.solar_birth_date">
          生：國曆 {{ node.solar_birth_date }}
        </div>
        <div v-if="node.lunar_death_date" class="truncate text-stone-500" :title="node.lunar_death_date">
          卒：{{ node.lunar_death_date }} {{ node.death_time_branch ? node.death_time_branch + '時' : '' }}
        </div>
      </div>

      <!-- 底部快捷操作 (檔案詳情 / 牌位製作 / 尋根溯源) -->
      <div class="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between text-xs font-serif" @click.stop>
        <button
          @click="$emit('select-person', node)"
          class="text-amber-900 hover:text-amber-950 font-bold hover:underline text-[11px]"
        >
          生平事略
        </button>
        <button
          @click="$emit('create-tablet', node)"
          class="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white px-2.5 py-0.5 rounded-lg text-[11px] shadow-2xs transition-all hover:scale-102 flex items-center gap-1"
        >
          <span>牌位排版</span>
        </button>
      </div>

      <!-- 展開收合子孫節點按鈕 (如意印鈕造型) -->
      <button
        v-if="node.children && node.children.length"
        @click.stop="isCollapsed = !isCollapsed"
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#3B2012] hover:bg-[#5C1415] text-[#F4ECD8] border border-[#D4AF37] flex items-center justify-center text-xs shadow-md transition-all z-20 hover:scale-110"
        :title="isCollapsed ? '展開後裔世系' : '收合後裔世系'"
      >
        <span class="font-bold font-mono text-[11px]">{{ isCollapsed ? '+' : '-' }}</span>
      </button>
    </div>

    <!-- 子世系分支連線與節點 (金絲導線傳承) -->
    <div
      v-if="node.children && node.children.length && !isCollapsed"
      class="children-container flex justify-center pt-8 relative"
    >
      <!-- 母線向下的垂直金絲連線 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-[#B8860B] to-[#917135]/60"></div>

      <!-- 子女並排容器 -->
      <div class="flex items-start">
        <div
          v-for="(child, idx) in node.children"
          :key="child.id"
          class="child-wrapper relative px-6"
        >
          <!-- 橫向金色連接導線 -->
          <div
            v-if="node.children.length > 1"
            class="absolute top-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]"
            :class="{
              'left-1/2 right-0': idx === 0,
              'left-0 right-1/2': idx === node.children.length - 1,
              'left-0 right-0': idx > 0 && idx < node.children.length - 1
            }"
          ></div>

          <!-- 子節點垂直引線 -->
          <div class="w-0.5 h-6 bg-[#B8860B]/70 mx-auto -mt-6"></div>

          <!-- 遞迴子元件 -->
          <TreeNode
            :node="child"
            :searchQuery="searchQuery"
            @select-person="$emit('select-person', $event)"
            @create-tablet="$emit('create-tablet', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: { type: Object, required: true },
  searchQuery: { type: String, default: '' }
});

defineEmits(['select-person', 'create-tablet']);

const isCollapsed = ref(false);

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false;
  const q = props.searchQuery.trim().toLowerCase();
  return props.node.name.toLowerCase().includes(q) ||
         (props.node.courtesy_name && props.node.courtesy_name.toLowerCase().includes(q));
});

function toChineseNumeral(num) {
  const map = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾'];
  if (num <= 10) return map[num] || num;
  return num;
}
</script>

<style scoped>
.tree-node-wrapper {
  position: relative;
}
</style>
