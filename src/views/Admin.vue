<template>
  <div class="admin">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <h1>管理员控制面板</h1>
      <nav>
        <router-link to="/">返回抽奖首页</router-link>
      </nav>
    </header>

    <!-- 侧边栏导航 -->
    <div class="admin-container">
      <aside class="admin-sidebar">
        <nav class="sidebar-nav">
          <router-link to="/admin/participants" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-text">参与者管理</span>
          </router-link>
          <router-link to="/admin/awards" class="nav-item">
            <span class="nav-icon">🏆</span>
            <span class="nav-text">奖项设置</span>
          </router-link>
          <router-link to="/admin/history" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-text">历史记录</span>
          </router-link>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
// 管理员控制面板逻辑
</script>

<style scoped>
.admin {
  width: 100vw;
  height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
}

.admin-header {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.admin-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--secondary-color);
}

.admin-header nav a {
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  background-color: var(--card-color);
}

.admin-header nav a:hover {
  background-color: var(--primary-color);
  color: white;
}

.admin-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.admin-sidebar {
  width: 250px;
  background-color: rgba(0, 0, 0, 0.1);
  border-right: 1px solid var(--border-color);
  padding: 20px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.nav-item:hover {
  background-color: var(--primary-color);
  color: white;
}

.nav-item.router-link-active {
  background-color: var(--secondary-color);
  color: white;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
}

.admin-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: 10px 0;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 10px;
  }

  .nav-item {
    white-space: nowrap;
    margin: 0;
  }

  .admin-content {
    padding: 20px;
  }
}
</style>