<template>
  <header class="bg-gradient-to-r from-amber-950 via-[#3B2211] to-amber-950 text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-amber-800/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
            <span class="font-serif font-black text-amber-300 text-xl tracking-tighter">根</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif font-bold text-lg tracking-wider text-amber-100">尋根系統 FindRoot</span>
              <span v-if="hallName" class="bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] px-2 py-0.5 rounded-full font-serif">
                {{ hallName }}
              </span>
            </div>
            <p class="text-[11px] text-amber-300/70 font-light tracking-widest hidden sm:block">
              祖先牌位格式整理 ‧ 族譜世系數位修編
            </p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="$emit('update:activeTab', item.id)"
            :class="[
              'px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 font-serif',
              activeTab === item.id
                ? 'bg-amber-800/80 text-white shadow border border-amber-600/50'
                : 'text-amber-200/80 hover:text-white hover:bg-white/10'
            ]"
          >
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- Action Button -->
        <div class="flex items-center gap-3">
          <button
            @click="$emit('open-add-member')"
            class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 border border-amber-400/30 font-serif"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>登錄族人</span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Scrollbar -->
      <div class="flex md:hidden overflow-x-auto py-2 border-t border-amber-900/40 space-x-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="$emit('update:activeTab', item.id)"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all font-serif',
            activeTab === item.id
              ? 'bg-amber-800 text-white font-bold'
              : 'text-amber-200/80 hover:bg-white/10'
          ]"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTab: { type: String, default: 'dashboard' },
  hallName: { type: String, default: '' }
});

defineEmits(['update:activeTab', 'open-add-member']);

const navItems = [
  { id: 'dashboard', label: '宗族總覽' },
  { id: 'members', label: '族人名冊' },
  { id: 'tree', label: '族譜世系圖' },
  { id: 'tablet', label: '牌位工作室' },
  { id: 'settings', label: '宗族與備份' }
];
</script>
