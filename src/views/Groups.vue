<template>
  <div class="groups">
    <h2>分组概率设置</h2>
    
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <button class="btn-primary" @click="saveGroupProbabilities">
        💾 保存设置
      </button>
      <button class="btn-secondary" @click="resetToDefault">
        🔄 重置为默认
      </button>
    </div>

    <!-- 分组概率设置表格 -->
    <div class="groups-container">
      <h3>分组概率设置</h3>
      <p class="hint">设置每个分组的中奖概率，所有分组的概率总和必须为100%</p>
      
      <table class="groups-table">
        <thead>
          <tr>
            <th>分组名称</th>
            <th>参与人数</th>
            <th>中奖概率</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in groupProbabilities" :key="group.name">
            <td>{{ group.name || '未分组' }}</td>
            <td>{{ getGroupCount(group.name) }}人</td>
            <td>
              <div class="probability-control">
                <input 
                  type="number" 
                  v-model.number="group.probability" 
                  min="0" 
                  max="100" 
                  step="1"
                  @input="updateTotalProbability"
                />
                <span class="percentage">%</span>
              </div>
            </td>
            <td>
              <button class="btn-danger btn-sm" @click="removeGroup(group.name)">
                删除
              </button>
            </td>
          </tr>
          <tr v-if="groupProbabilities.length === 0">
            <td colspan="4" class="empty-state">
              暂无分组，请先添加参与者并设置分组
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 总概率显示 -->
      <div class="total-probability" :class="{ invalid: totalProbability !== 100 }">
        <span>总概率：{{ totalProbability }}%</span>
        <span v-if="totalProbability !== 100" class="error-message">
          {{ totalProbability < 100 ? '总概率不足100%' : '总概率超过100%' }}
        </span>
      </div>
    </div>

    <!-- 手动添加分组 -->
    <div class="add-group-section" v-if="groupProbabilities.length > 0">
      <h3>手动添加分组</h3>
      <form @submit.prevent="addNewGroup">
        <div class="form-row">
          <div class="form-group">
            <label for="group-name">分组名称</label>
            <input 
              type="text" 
              id="group-name" 
              v-model="newGroupName" 
              placeholder="请输入分组名称"
              required
            />
          </div>
          <div class="form-group">
            <label for="group-probability">中奖概率</label>
            <div class="probability-control">
              <input 
                type="number" 
                id="group-probability" 
                v-model.number="newGroupProbability" 
                min="0" 
                max="100" 
                step="1"
                required
              />
              <span class="percentage">%</span>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">添加分组</button>
        </div>
      </form>
    </div>

    <!-- 导入提示 -->
    <div class="import-tips">
      <h4>使用说明：</h4>
      <ul>
        <li>分组会自动从参与者数据中提取</li>
        <li>未分组的参与者默认概率为0%</li>
        <li>可以手动添加新分组并设置概率</li>
        <li>保存设置后，抽奖时会根据分组概率进行加权随机</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 响应式数据
const groupProbabilities = ref([])
const totalProbability = ref(0)
const newGroupName = ref('')
const newGroupProbability = ref(0)

// 从本地存储获取参与者数据
const participants = ref([])

// 生命周期
onMounted(() => {
  loadParticipants()
  loadGroupProbabilities()
  updateTotalProbability()
})

// 监听参与者变化，自动更新分组列表
watch(participants, () => {
  updateGroupList()
}, { deep: true })

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

const loadGroupProbabilities = () => {
  try {
    const savedGroupProbabilities = localStorage.getItem('groupProbabilities')
    if (savedGroupProbabilities) {
      groupProbabilities.value = JSON.parse(savedGroupProbabilities)
    } else {
      // 初始化分组概率
      initGroupProbabilities()
    }
  } catch (error) {
    console.error('加载分组概率失败:', error)
    initGroupProbabilities()
  }
}

const initGroupProbabilities = () => {
  // 从参与者中提取所有分组
  const groups = new Set()
  participants.value.forEach(p => {
    groups.add(p.group || '')
  })

  // 初始化分组概率
  const initialGroups = Array.from(groups).map(groupName => ({
    name: groupName,
    probability: 0
  }))

  // 如果只有一个分组，设置概率为100%
  if (initialGroups.length === 1) {
    initialGroups[0].probability = 100
  }

  groupProbabilities.value = initialGroups
  saveGroupProbabilities()
  updateTotalProbability()
}

const updateGroupList = () => {
  // 从参与者中提取所有分组
  const groups = new Set()
  participants.value.forEach(p => {
    groups.add(p.group || '')
  })

  // 检查是否有新分组
  const existingGroupNames = new Set(groupProbabilities.value.map(g => g.name))
  const newGroups = Array.from(groups).filter(groupName => !existingGroupNames.has(groupName))

  // 添加新分组
  if (newGroups.length > 0) {
    newGroups.forEach(groupName => {
      groupProbabilities.value.push({
        name: groupName,
        probability: 0
      })
    })
    saveGroupProbabilities()
  }
}

const getGroupCount = (groupName) => {
  return participants.value.filter(p => p.group === groupName).length
}

const updateTotalProbability = () => {
  totalProbability.value = groupProbabilities.value.reduce((sum, group) => sum + (group.probability || 0), 0)
}

const saveGroupProbabilities = () => {
  try {
    localStorage.setItem('groupProbabilities', JSON.stringify(groupProbabilities.value))
    alert('保存成功！')
  } catch (error) {
    console.error('保存分组概率失败:', error)
    alert('保存失败，请重试')
  }
}

const resetToDefault = () => {
  if (confirm('确定要重置为默认设置吗？')) {
    initGroupProbabilities()
    alert('已重置为默认设置')
  }
}

const removeGroup = (groupName) => {
  if (confirm(`确定要删除${groupName || '未分组'}吗？`)) {
    groupProbabilities.value = groupProbabilities.value.filter(g => g.name !== groupName)
    updateTotalProbability()
    saveGroupProbabilities()
  }
}

const addNewGroup = () => {
  if (!newGroupName.value.trim()) {
    alert('请输入分组名称')
    return
  }

  if (groupProbabilities.value.some(g => g.name === newGroupName.value.trim())) {
    alert('该分组已存在')
    return
  }

  groupProbabilities.value.push({
    name: newGroupName.value.trim(),
    probability: newGroupProbability.value
  })

  updateTotalProbability()
  newGroupName.value = ''
  newGroupProbability.value = 0
  saveGroupProbabilities()
}
</script>

<style scoped>
.groups {
  max-width: 1000px;
  margin: 0 auto;
}

.groups h2 {
  margin-bottom: 30px;
  color: var(--secondary-color);
  font-size: 24px;
}

.groups h3 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 18px;
}

.groups h4 {
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

.btn-danger:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.groups-container {
  background-color: var(--card-color);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hint {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.groups-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.groups-table th,
.groups-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.groups-table th {
  background-color: rgba(0, 0, 0, 0.2);
  font-weight: 600;
  color: var(--secondary-color);
}

.groups-table tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.probability-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.probability-control input {
  width: 80px;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 14px;
}

.probability-control input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

.percentage {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.total-probability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-top: 20px;
  font-weight: 500;
}

.total-probability.invalid {
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.add-group-section {
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

.import-tips {
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

  .groups-table {
    font-size: 14px;
  }

  .groups-table th,
  .groups-table td {
    padding: 10px 12px;
  }

  .probability-control input {
    width: 60px;
  }
}
</style>