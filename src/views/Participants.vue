<template>
  <div class="participants">
    <h2>参与者管理</h2>
    
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <button class="btn-primary" @click="showAddForm = true">
        ➕ 手动添加
      </button>
      <button class="btn-secondary" @click="triggerFileInput">
        📁 批量导入
      </button>
      <button class="btn-danger" @click="clearAllParticipants" :disabled="participants.length === 0">
        🗑️ 清空所有
      </button>
      <input 
        type="file" 
        ref="fileInput" 
        accept=".csv,.txt" 
        style="display: none" 
        @change="handleFileImport"
      />
    </div>

    <!-- 手动添加表单 -->
    <div class="add-form" v-if="showAddForm">
      <h3>手动添加参与者</h3>
      <form @submit.prevent="addParticipant">
        <div class="form-row">
          <div class="form-group">
            <label for="name">姓名</label>
            <input 
              type="text" 
              id="name" 
              v-model="newParticipant.name" 
              placeholder="请输入姓名" 
              required
            />
          </div>
          <div class="form-group">
            <label for="id">编号</label>
            <input 
              type="text" 
              id="id" 
              v-model="newParticipant.id" 
              placeholder="请输入编号" 
              required
            />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">添加</button>
          <button type="button" class="btn-secondary" @click="showAddForm = false">取消</button>
        </div>
      </form>
    </div>

    <!-- 参与者列表 -->
    <div class="participants-list">
      <h3>参与者列表 ({{ participants.length }}人)</h3>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索参与者姓名或编号"
        />
      </div>
      <table class="participants-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>姓名</th>
            <th>编号</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in filteredParticipants" :key="participant.id">
            <td>{{ index + 1 }}</td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.id }}</td>
            <td>
              <button class="btn-danger btn-sm" @click="removeParticipant(participant.id)">
                删除
              </button>
            </td>
          </tr>
          <tr v-if="filteredParticipants.length === 0">
            <td colspan="4" class="empty-state">
              {{ participants.length === 0 ? '暂无参与者，请添加' : '未找到匹配的参与者' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 导入提示 -->
    <div class="import-tips" v-if="!showAddForm">
      <h4>批量导入提示：</h4>
      <ul>
        <li>支持 CSV 或 TXT 文件格式</li>
        <li>文件内容格式：姓名,编号（每行一条记录）</li>
        <li>示例：张三,001</li>
        <li>系统会自动去重，避免重复添加</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const showAddForm = ref(false)
const newParticipant = ref({ name: '', id: '' })
const searchKeyword = ref('')
const fileInput = ref(null)
const participants = ref([])

// 计算属性
const filteredParticipants = computed(() => {
  if (!searchKeyword.value) {
    return participants.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return participants.value.filter(p => 
    p.name.toLowerCase().includes(keyword) || 
    p.id.toLowerCase().includes(keyword)
  )
})

// 生命周期
onMounted(() => {
  loadParticipants()
})

// 方法
const loadParticipants = () => {
  try {
    const savedParticipants = localStorage.getItem('participants')
    if (savedParticipants) {
      participants.value = JSON.parse(savedParticipants)
    }
  } catch (error) {
    console.error('加载参与者数据失败:', error)
  }
}

const saveParticipants = () => {
  try {
    localStorage.setItem('participants', JSON.stringify(participants.value))
  } catch (error) {
    console.error('保存参与者数据失败:', error)
  }
}

const addParticipant = () => {
  // 验证数据
  if (!newParticipant.value.name.trim() || !newParticipant.value.id.trim()) {
    alert('请填写完整的参与者信息')
    return
  }

  // 检查是否重复
  const isDuplicate = participants.value.some(p => p.id === newParticipant.value.id)
  if (isDuplicate) {
    alert('该编号的参与者已存在')
    return
  }

  // 添加参与者
  participants.value.push({
    id: newParticipant.value.id.trim(),
    name: newParticipant.value.name.trim()
  })

  // 保存到本地存储
  saveParticipants()

  // 重置表单
  newParticipant.value = { name: '', id: '' }
  showAddForm.value = false

  alert('添加成功！')
}

const removeParticipant = (id) => {
  if (confirm('确定要删除该参与者吗？')) {
    participants.value = participants.value.filter(p => p.id !== id)
    saveParticipants()
    alert('删除成功！')
  }
}

const clearAllParticipants = () => {
  if (confirm('确定要清空所有参与者吗？此操作不可恢复！')) {
    participants.value = []
    saveParticipants()
    alert('清空成功！')
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      const lines = content.split('\n')
      const importedParticipants = []
      let successCount = 0
      let duplicateCount = 0

      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return

        const parts = trimmedLine.split(',')
        if (parts.length < 2) {
          console.warn(`第${index + 1}行格式错误：${line}`)
          return
        }

        const name = parts[0].trim()
        const id = parts[1].trim()

        if (!name || !id) {
          console.warn(`第${index + 1}行缺少信息：${line}`)
          return
        }

        // 检查是否重复
        const isDuplicate = participants.value.some(p => p.id === id) || 
                           importedParticipants.some(p => p.id === id)
        if (isDuplicate) {
          duplicateCount++
          return
        }

        importedParticipants.push({ id, name })
        successCount++
      })

      // 添加到参与者列表
      participants.value = [...participants.value, ...importedParticipants]
      saveParticipants()

      // 显示导入结果
      alert(`导入完成！\n成功添加：${successCount}人\n重复跳过：${duplicateCount}人`)

      // 重置文件输入
      event.target.value = ''
    } catch (error) {
      console.error('导入文件失败:', error)
      alert('导入文件失败，请检查文件格式')
    }
  }
  reader.onerror = () => {
    alert('读取文件失败')
  }
  reader.readAsText(file, 'UTF-8')
}
</script>

<style scoped>
.participants {
  max-width: 1000px;
  margin: 0 auto;
}

.participants h2 {
  margin-bottom: 30px;
  color: var(--secondary-color);
  font-size: 24px;
}

.participants h3 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 18px;
}

.participants h4 {
  margin-bottom: 10px;
  color: var(--text-color);
  font-size: 16px;
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

.add-form {
  background-color: var(--card-color);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.search-bar {
  margin-bottom: 20px;
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

.participants-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.participants-table th,
.participants-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.participants-table th {
  background-color: rgba(0, 0, 0, 0.2);
  font-weight: 600;
  color: var(--secondary-color);
}

.participants-table tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.import-tips {
  margin-top: 30px;
  background-color: var(--card-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.import-tips ul {
  list-style-type: disc;
  margin-left: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.import-tips li {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    min-width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .participants-table {
    font-size: 14px;
  }

  .participants-table th,
  .participants-table td {
    padding: 10px 12px;
  }
}
</style>