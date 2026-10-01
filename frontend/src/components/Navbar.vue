<template>
  <header class="bg-gradient-to-r from-amber-950 via-[#3B2211] to-amber-950 text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-amber-800/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$emit('update:activeTab', 'dashboard')">
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
        <nav class="hidden lg:flex items-center space-x-1">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="$emit('update:activeTab', item.id)"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 font-serif',
              activeTab === item.id
                ? 'bg-amber-800/80 text-white shadow border border-amber-600/50'
                : 'text-amber-200/80 hover:text-white hover:bg-white/10'
            ]"
          >
            <span>{{ item.label }}</span>
            <span v-if="item.id === 'ai'" class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          </button>
        </nav>

        <!-- User Profile & Action Buttons -->
        <div class="flex items-center gap-2.5">
          <!-- 登錄新族人按鈕 -->
          <button
            @click="$emit('open-add-member')"
            class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 border border-amber-400/30 font-serif"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span class="hidden sm:inline">登錄族人</span>
          </button>

          <!-- 使用者狀態顯示 -->
          <div v-if="currentUser" class="flex items-center gap-2 pl-2 border-l border-amber-800/60">
            <div class="hidden sm:flex flex-col items-end text-right">
              <span class="text-xs font-serif font-bold text-amber-100">{{ currentUser.displayName }}</span>
              <span
                :class="[
                  'text-[9px] px-1.5 rounded font-sans font-bold',
                  currentUser.role === 'admin' ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40' : 'bg-amber-900/60 text-amber-200'
                ]"
              >
                {{ currentUser.role === 'admin' ? '系統管理員' : '宗親會員' }}
              </span>
            </div>
            <button
              @click="$emit('logout')"
              title="登出系統"
              class="text-xs text-amber-300/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors font-serif"
            >
              登出
            </button>
          </div>

          <!-- 未登入時顯示按鈕 -->
          <div v-else class="pl-2 border-l border-amber-800/60">
            <button
              @click="$emit('open-auth')"
              class="text-xs bg-amber-900/80 hover:bg-amber-800 text-amber-100 hover:text-white px-3 py-1.5 rounded-xl border border-amber-700/60 font-serif transition-colors"
            >
              登入 / 註冊
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Scrollbar -->
      <div class="flex lg:hidden overflow-x-auto py-2 border-t border-amber-900/40 space-x-1.5">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="$emit('update:activeTab', item.id)"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all font-serif',
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
  hallName: { type: String, default: '' },
  currentUser: { type: Object, default: null }
});

defineEmits(['update:activeTab', 'open-add-member', 'open-auth', 'logout']);

const navItems = [
  { id: 'dashboard', label: '宗族總覽' },
  { id: 'members', label: '族人名冊' },
  { id: 'tree', label: '族譜世系圖' },
  { id: 'tablet', label: '牌位工作室' },
  { id: 'ai', label: 'AI 智慧助手' },
  { id: 'settings', label: '宗族與設定' }
];
</script>
