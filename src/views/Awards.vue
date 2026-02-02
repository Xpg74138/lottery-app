<template>
  <div class="awards">
    <h2>奖项设置</h2>
    
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <button class="btn-primary" @click="showAddForm = true">
        ➕ 添加奖项
      </button>
      <button class="btn-danger" @click="clearAllAwards" :disabled="awards.length === 0">
        🗑️ 清空所有
      </button>
    </div>

    <!-- 添加奖项表单 -->
    <div class="add-form" v-if="showAddForm">
      <h3>添加奖项</h3>
      <form @submit.prevent="addAward">
        <div class="form-row">
          <div class="form-group">
            <label for="award-name">奖项名称</label>
            <input 
              type="text" 
              id="award-name" 
              v-model="newAward.name" 
              placeholder="请输入奖项名称" 
              required
            />
          </div>
          <div class="form-group">
            <label for="award-count">获奖人数</label>
            <input 
              type="number" 
              id="award-count" 
              v-model.number="newAward.count" 
              placeholder="请输入获奖人数" 
              min="1" 
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label for="award-color">展示颜色</label>
          <div class="color-picker">
            <input 
              type="color" 
              id="award-color" 
              v-model="newAward.color" 
            />
            <span class="color-value">{{ newAward.color }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">添加</button>
          <button type="button" class="btn-secondary" @click="showAddForm = false">取消</button>
        </div>
      </form>
    </div>

    <!-- 奖项列表 -->
    <div class="awards-list">
      <h3>奖项列表 ({{ awards.length }}个)</h3>
      <div class="awards-grid">
        <div 
          v-for="award in awards" 
          :key="award.id" 
          class="award-card"
          :style="{ borderLeftColor: award.color }"
        >
          <div class="award-info">
            <h4>{{ award.name }}</h4>
            <p>获奖人数：{{ award.count }}名</p>
            <p>展示颜色：<span class="color-preview" :style="{ backgroundColor: award.color }"></span> {{ award.color }}</p>
          </div>
          <div class="award-actions">
            <button class="btn-secondary btn-sm" @click="editAward(award)">
              编辑
            </button>
            <button class="btn-danger btn-sm" @click="removeAward(award.id)">
              删除
            </button>
          </div>
        </div>
        <div v-if="awards.length === 0" class="empty-state">
          <p>暂无奖项，请添加</p>
        </div>
      </div>
    </div>

    <!-- 编辑奖项表单 -->
    <div class="edit-form" v-if="showEditForm">
      <h3>编辑奖项</h3>
      <form @submit.prevent="updateAward">
        <div class="form-row">
          <div class="form-group">
            <label for="edit-award-name">奖项名称</label>
            <input 
              type="text" 
              id="edit-award-name" 
              v-model="editingAward.name" 
              placeholder="请输入奖项名称" 
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-award-count">获奖人数</label>
            <input 
              type="number" 
              id="edit-award-count" 
              v-model.number="editingAward.count" 
              placeholder="请输入获奖人数" 
              min="1" 
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label for="edit-award-color">展示颜色</label>
          <div class="color-picker">
            <input 
              type="color" 
              id="edit-award-color" 
              v-model="editingAward.color" 
            />
            <span class="color-value">{{ editingAward.color }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">保存</button>
          <button type="button" class="btn-secondary" @click="showEditForm = false">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const showAddForm = ref(false)
const showEditForm = ref(false)
const newAward = ref({ name: '', count: 1, color: '#e94560' })
const editingAward = ref({ id: '', name: '', count: 1, color: '#e94560' })
const awards = ref([])

// 生命周期
onMounted(() => {
  loadAwards()
})

// 方法
const loadAwards = () => {
  try {
    const savedAwards = localStorage.getItem('awards')
    if (savedAwards) {
      awards.value = JSON.parse(savedAwards)
    }
  } catch (error) {
    console.error('加载奖项数据失败:', error)
  }
}

const saveAwards = () => {
  try {
    localStorage.setItem('awards', JSON.stringify(awards.value))
  } catch (error) {
    console.error('保存奖项数据失败:', error)
  }
}

const addAward = () => {
  // 验证数据
  if (!newAward.value.name.trim() || newAward.value.count < 1) {
    alert('请填写完整的奖项信息')
    return
  }

  // 检查是否重复
  const isDuplicate = awards.value.some(a => a.name === newAward.value.name)
  if (isDuplicate) {
    alert('该奖项名称已存在')
    return
  }

  // 添加奖项
  const award = {
    id: Date.now().toString(),
    name: newAward.value.name.trim(),
    count: newAward.value.count,
    color: newAward.value.color
  }

  awards.value.push(award)
  saveAwards()

  // 重置表单
  newAward.value = { name: '', count: 1, color: '#e94560' }
  showAddForm.value = false

  alert('添加成功！')
}

const editAward = (award) => {
  // 复制奖项信息到编辑表单
  editingAward.value = { ...award }
  showEditForm.value = true
  showAddForm.value = false
}

const updateAward = () => {
  // 验证数据
  if (!editingAward.value.name.trim() || editingAward.value.count < 1) {
    alert('请填写完整的奖项信息')
    return
  }

  // 检查是否重复（排除当前奖项）
  const isDuplicate = awards.value.some(a => 
    a.name === editingAward.value.name && a.id !== editingAward.value.id
  )
  if (isDuplicate) {
    alert('该奖项名称已存在')
    return
  }

  // 更新奖项
  const index = awards.value.findIndex(a => a.id === editingAward.value.id)
  if (index !== -1) {
    awards.value[index] = { ...editingAward.value }
    saveAwards()
    showEditForm.value = false
    alert('更新成功！')
  }
}

const removeAward = (id) => {
  if (confirm('确定要删除该奖项吗？')) {
    awards.value = awards.value.filter(a => a.id !== id)
    saveAwards()
    alert('删除成功！')
  }
}

const clearAllAwards = () => {
  if (confirm('确定要清空所有奖项吗？此操作不可恢复！')) {
    awards.value = []
    saveAwards()
    alert('清空成功！')
  }
}
</script>

<style scoped>
.awards {
  max-width: 1000px;
  margin: 0 auto;
}

.awards h2 {
  margin-bottom: 30px;
  color: var(--secondary-color);
  font-size: 24px;
}

.awards h3 {
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

.add-form,
.edit-form {
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

.form-group input[type="text"],
.form-group input[type="number"] {
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

.color-picker {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-picker input[type="color"] {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.color-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.award-card {
  background-color: var(--card-color);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid var(--secondary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.award-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.award-info h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-color);
}

.award-info p {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.award-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  background-color: var(--card-color);
  border-radius: 8px;
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

  .awards-grid {
    grid-template-columns: 1fr;
  }

  .color-picker {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .color-value {
    min-width: auto;
  }
}
</style>