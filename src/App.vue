<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 初始化本地存储
  if (!localStorage.getItem('participants')) {
    localStorage.setItem('participants', JSON.stringify([]))
  }
  if (!localStorage.getItem('awards')) {
    localStorage.setItem('awards', JSON.stringify([]))
  }
  if (!localStorage.getItem('history')) {
    localStorage.setItem('history', JSON.stringify([]))
  }
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify({
      theme: 'default',
      background: '#1a1a2e',
      primaryColor: '#0f3460',
      secondaryColor: '#e94560',
      fontSize: '16px'
    }))
  }
})
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局样式 */
:root {
  --primary-color: #0f3460;
  --secondary-color: #e94560;
  --background-color: #1a1a2e;
  --text-color: #ffffff;
  --card-color: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-color);
  color: var(--text-color);
  overflow: hidden;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
  outline: none;
  border: none;
  background: var(--card-color);
  color: var(--text-color);
  padding: 8px 12px;
  border-radius: 4px;
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>