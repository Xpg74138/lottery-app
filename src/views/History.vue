<template>
  <div class="history">
    <h2>抽奖历史记录</h2>
    
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <button class="btn-danger" @click="clearAllHistory" :disabled="history.length === 0">
        🗑️ 清空历史
      </button>
      <button class="btn-secondary" @click="exportHistory">
        📤 导出记录
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索获奖者姓名或奖项"
        />
      </div>
      <div class="filter-group">
        <label for="award-filter">按奖项筛选</label>
        <select id="award-filter" v-model="selectedAward">
          <option value="">全部奖项</option>
          <option v-for="award in awards" :key="award.id" :value="award.id">
            {{ award.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list">
      <h3>中奖记录 ({{ filteredHistory.length }}条)</h3>
      <table class="history-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>姓名</th>
            <th>奖项</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredHistory" :key="record.id">
            <td>{{ index + 1 }}</td>
            <td>{{ record.participantName }}</td>
            <td>{{ record.awardName }}</td>
            <td>{{ formatDate(record.timestamp) }}</td>
            <td>
              <button class="btn-danger btn-sm" @click="removeRecord(record.id)">
                删除
              </button>
            </td>
          </tr>
          <tr v-if="filteredHistory.length === 0">
            <td colspan="5" class="empty-state">
              {{ history.length === 0 ? '暂无抽奖记录' : '未找到匹配的记录' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 统计信息 -->
    <div class="statistics" v-if="history.length > 0">
      <h3>统计信息</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ history.length }}</div>
          <div class="stat-label">总中奖人次</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueWinners.length }}</div>
          <div class="stat-label">中奖人数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ awards.length }}</div>
          <div class="stat-label">奖项数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatDate(history[0].timestamp) }}</div>
          <div class="stat-label">最近抽奖</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const selectedAward = ref('')
const history = ref([])
const awards = ref([])

// 计算属性
const filteredHistory = computed(() => {
  let filtered = [...history.value]

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.participantName.toLowerCase().includes(keyword) ||
      record.awardName.toLowerCase().includes(keyword)
    )
  }

  // 按奖项筛选
  if (selectedAward.value) {
    filtered = filtered.filter(record => record.awardId === selectedAward.value)
  }

  // 按时间倒序排列
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const uniqueWinners = computed(() => {
  const winnerIds = new Set(history.value.map(record => record.participantId))
  return Array.from(winnerIds)
})

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = () => {
  try {
    const savedHistory = localStorage.getItem('history')
    const savedAwards = localStorage.getItem('awards')
    
    if (savedHistory) {
      history.value = JSON.parse(savedHistory)
    }
    if (savedAwards) {
      awards.value = JSON.parse(savedAwards)
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem('history', JSON.stringify(history.value))
  } catch (error) {
    console.error('保存历史数据失败:', error)
  }
}

const removeRecord = (id) => {
  if (confirm('确定要删除该记录吗？')) {
    history.value = history.value.filter(record => record.id !== id)
    saveHistory()
    alert('删除成功！')
  }
}

const clearAllHistory = () => {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
    history.value = []
    saveHistory()
    alert('清空成功！')
  }
}

const exportHistory = () => {
  if (history.length === 0) {
    alert('暂无记录可导出')
    return
  }

  // 生成CSV内容
  const headers = ['姓名', '奖项', '时间']
  const rows = history.value.map(record => [
    record.participantName,
    record.awardName,
    formatDate(record.timestamp)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `抽奖记录_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  alert('导出成功！')
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}
</script>

<style scoped>
.history {
  max-width: 1000px;
  margin: 0 auto;
}

.history h2 {
  margin-bottom: 30px;
  color: var(--secondary-color);
  font-size: 24px;
}

.history h3 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.btn-primary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #d13753;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.btn-secondary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #0c2a4a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 52, 96, 0.4);
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 16px;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-color);
}

.filter-group select {
  padding: 10px 12px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 16px;
  min-width: 150px;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-table th,
.history-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-table th {
  background-color: rgba(0, 0, 0, 0.2);
  font-weight: 600;
  color: var(--secondary-color);
}

.history-table tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.statistics {
  margin-top: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: var(--card-color);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--secondary-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .filters {
    flex-direction: column;
    gap: 15px;
  }

  .search-bar {
    min-width: 100%;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filter-group select {
    min-width: 100%;
  }

  .history-table {
    font-size: 14px;
  }

  .history-table th,
  .history-table td {
    padding: 10px 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>