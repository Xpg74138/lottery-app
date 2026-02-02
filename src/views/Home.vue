<template>
  <div class="home">
    <!-- 顶部导航 -->
    <header class="header">
      <h1>年会在线大屏抽奖</h1>
      <nav>
        <router-link to="/">抽奖首页</router-link>
        <router-link to="/admin">管理面板</router-link>
      </nav>
    </header>

    <!-- 抽奖区域 -->
    <main class="lottery-container">
      <!-- 抽奖模式选择 -->
      <div class="lottery-mode">
        <h2>选择抽奖模式</h2>
        <div class="mode-buttons">
          <button 
            v-for="mode in lotteryModes" 
            :key="mode.value"
            :class="{ active: selectedMode === mode.value }"
            @click="selectedMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <!-- 奖项选择 -->
      <div class="award-selection" v-if="selectedMode === 'specified'">
        <h2>选择奖项</h2>
        <select v-model="selectedAward">
          <option value="">请选择奖项</option>
          <option v-for="award in awards" :key="award.id" :value="award.id">
            {{ award.name }} ({{ award.count }}名)
          </option>
        </select>
      </div>

      <!-- 抽奖界面 -->
      <div class="lottery-display">
        <div class="lottery-wheel" v-if="selectedMode === 'random'">
          <div class="wheel-content">
            <div class="spinning-names" v-if="isSpinning">
              <div v-for="i in 5" :key="i" class="name-item">
                {{ spinningNames[i - 1] || '' }}
              </div>
            </div>
            <div class="result" v-else-if="currentResult">
              <h3>中奖啦！</h3>
              <p class="winner-name">{{ currentResult.name }}</p>
              <p class="winner-id">{{ currentResult.id }}</p>
            </div>
            <div class="placeholder" v-else>
              <h3>点击开始抽奖</h3>
              <p>祝您好运！</p>
            </div>
          </div>
        </div>

        <div class="lottery-scroll" v-else-if="selectedMode === 'scroll'">
          <div class="scroll-content">
            <div class="scrolling-names" :class="{ spinning: isSpinning }">
              <div v-for="participant in participants" :key="participant.id" class="name-item">
                {{ participant.name }}
              </div>
            </div>
            <div class="result" v-if="!isSpinning && currentResult">
              <h3>中奖啦！</h3>
              <p class="winner-name">{{ currentResult.name }}</p>
              <p class="winner-id">{{ currentResult.id }}</p>
            </div>
          </div>
        </div>

        <div class="lottery-specified" v-else-if="selectedMode === 'specified' && selectedAward">
          <div class="specified-content">
            <div class="award-info">
              <h3>{{ selectedAwardInfo?.name || '' }}</h3>
              <p>剩余名额：{{ selectedAwardInfo?.remaining || 0 }} / {{ selectedAwardInfo?.count || 0 }}</p>
            </div>
            <div class="spinning-names" v-if="isSpinning">
              <div v-for="i in 5" :key="i" class="name-item">
                {{ spinningNames[i - 1] || '' }}
              </div>
            </div>
            <div class="result" v-else-if="currentResult">
              <h3>中奖啦！</h3>
              <p class="winner-name">{{ currentResult.name }}</p>
              <p class="winner-id">{{ currentResult.id }}</p>
            </div>
            <div class="placeholder" v-else>
              <h3>点击开始抽奖</h3>
              <p>祝您好运！</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽奖控制按钮 -->
      <div class="lottery-controls">
        <button 
          class="control-button start" 
          @click="startLottery"
          :disabled="isSpinning || !canStartLottery"
        >
          {{ isSpinning ? '抽奖中...' : '开始抽奖' }}
        </button>
        <button 
          class="control-button stop" 
          @click="stopLottery"
          :disabled="!isSpinning"
        >
          停止抽奖
        </button>
        <button 
          class="control-button reset" 
          @click="resetLottery"
          :disabled="isSpinning"
        >
          重置
        </button>
      </div>

      <!-- 抽奖结果展示 -->
      <div class="lottery-results" v-if="showResults">
        <h2>中奖结果</h2>
        <div class="results-list">
          <div v-for="(result, index) in recentResults" :key="index" class="result-item">
            <span class="result-rank">{{ index + 1 }}</span>
            <span class="result-name">{{ result.name }}</span>
            <span class="result-award">{{ result.awardName }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 响应式数据
const selectedMode = ref('random') // 抽奖模式：random, scroll, specified
const selectedAward = ref('') // 选择的奖项ID
const isSpinning = ref(false) // 是否正在抽奖
const currentResult = ref(null) // 当前抽奖结果
const spinningNames = ref([]) // 滚动显示的名字
const showResults = ref(false) // 是否显示结果
const recentResults = ref([]) // 最近中奖结果

// 从本地存储获取数据
const participants = ref([]) // 参与者列表
const awards = ref([]) // 奖项列表
const history = ref([]) // 历史记录
const groupProbabilities = ref([]) // 分组概率设置

// 计算属性
const canStartLottery = computed(() => {
  if (participants.value.length === 0) return false
  if (selectedMode.value === 'specified' && !selectedAward.value) return false
  return true
})

const selectedAwardInfo = computed(() => {
  if (!selectedAward.value) return null
  const award = awards.value.find(a => a.id === selectedAward.value)
  if (!award) return null
  // 计算剩余名额
  const usedCount = history.value.filter(h => h.awardId === selectedAward.value).length
  return {
    ...award,
    remaining: Math.max(0, award.count - usedCount)
  }
})

// 抽奖模式选项
const lotteryModes = [
  { label: '随机抽取', value: 'random' },
  { label: '滚动抽奖', value: 'scroll' },
  { label: '指定奖项', value: 'specified' }
]

// 生命周期
onMounted(() => {
  loadData()
})

// 监听选择的奖项
watch(selectedAward, (newAwardId) => {
  if (newAwardId) {
    // 重置当前结果
    currentResult.value = null
  }
})

// 方法
const loadData = () => {
  try {
    const savedParticipants = localStorage.getItem('participants')
    const savedAwards = localStorage.getItem('awards')
    const savedHistory = localStorage.getItem('history')
    const savedGroupProbabilities = localStorage.getItem('groupProbabilities')
    
    if (savedParticipants) {
      participants.value = JSON.parse(savedParticipants)
    }
    if (savedAwards) {
      awards.value = JSON.parse(savedAwards)
    }
    if (savedHistory) {
      history.value = JSON.parse(savedHistory)
      // 更新最近中奖结果
      recentResults.value = history.value.slice(-10).reverse()
    }
    if (savedGroupProbabilities) {
      groupProbabilities.value = JSON.parse(savedGroupProbabilities)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const startLottery = () => {
  if (!canStartLottery.value) return
  
  isSpinning.value = true
  currentResult.value = null
  
  // 生成滚动名字
  generateSpinningNames()
  
  // 开始滚动动画
  startSpinningAnimation()
}

const stopLottery = () => {
  isSpinning.value = false
  
  // 停止滚动动画
  stopSpinningAnimation()
  
  // 生成抽奖结果
  generateLotteryResult()
}

const resetLottery = () => {
  isSpinning.value = false
  currentResult.value = null
  spinningNames.value = []
  showResults.value = false
}

const generateSpinningNames = () => {
  // 生成随机名字数组用于滚动显示
  const names = participants.value.map(p => p.name)
  const spinning = []
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * names.length)
    spinning.push(names[randomIndex])
  }
  spinningNames.value = spinning
}

const startSpinningAnimation = () => {
  // 每100毫秒更新一次滚动名字
  const interval = setInterval(() => {
    if (!isSpinning.value) {
      clearInterval(interval)
      return
    }
    generateSpinningNames()
  }, 100)
}

const stopSpinningAnimation = () => {
  // 动画停止逻辑
}

const generateLotteryResult = () => {
  // 根据选择的模式生成抽奖结果
  let availableParticipants = [...participants.value]
  
  // 排除已经中奖的参与者
  const winnerIds = history.value.map(h => h.participantId)
  availableParticipants = availableParticipants.filter(p => !winnerIds.includes(p.id))
  
  if (availableParticipants.length === 0) {
    alert('所有参与者都已中奖！')
    return
  }
  
  // 根据分组概率进行加权随机
  const winner = selectWinnerByGroupProbability(availableParticipants)
  
  // 生成抽奖记录
  const awardName = selectedMode.value === 'specified' && selectedAward.value 
    ? awards.value.find(a => a.id === selectedAward.value)?.name || '随机奖'
    : '随机奖'
  
  const lotteryRecord = {
    id: Date.now().toString(),
    participantId: winner.id,
    participantName: winner.name,
    awardId: selectedAward.value || 'random',
    awardName: awardName,
    timestamp: new Date().toISOString()
  }
  
  // 更新本地存储
  history.value.push(lotteryRecord)
  localStorage.setItem('history', JSON.stringify(history.value))
  
  // 更新当前结果和最近结果
  currentResult.value = winner
  recentResults.value = history.value.slice(-10).reverse()
  showResults.value = true
  
  // 播放中奖音效
  playWinningSound()
}

const selectWinnerByGroupProbability = (availableParticipants) => {
  // 如果没有分组概率设置，或者所有分组概率都为0，则随机选择
  if (groupProbabilities.value.length === 0 || 
      groupProbabilities.value.every(g => g.probability === 0)) {
    const randomIndex = Math.floor(Math.random() * availableParticipants.length)
    return availableParticipants[randomIndex]
  }
  
  // 创建分组概率映射
  const groupProbabilityMap = new Map()
  groupProbabilities.value.forEach(g => {
    groupProbabilityMap.set(g.name, g.probability || 0)
  })
  
  // 计算每个参与者的权重
  const weightedParticipants = availableParticipants.map(p => {
    const groupProbability = groupProbabilityMap.get(p.group) || 0
    return {
      participant: p,
      weight: groupProbability
    }
  })
  
  // 过滤掉权重为0的参与者
  const validWeightedParticipants = weightedParticipants.filter(wp => wp.weight > 0)
  
  // 如果所有参与者权重都为0，则随机选择
  if (validWeightedParticipants.length === 0) {
    const randomIndex = Math.floor(Math.random() * availableParticipants.length)
    return availableParticipants[randomIndex]
  }
  
  // 计算总权重
  const totalWeight = validWeightedParticipants.reduce((sum, wp) => sum + wp.weight, 0)
  
  // 生成随机数
  let random = Math.random() * totalWeight
  
  // 根据权重选择中奖者
  for (const wp of validWeightedParticipants) {
    random -= wp.weight
    if (random <= 0) {
      return wp.participant
    }
  }
  
  // 兜底：如果以上逻辑出错，随机选择一个
  const randomIndex = Math.floor(Math.random() * availableParticipants.length)
  return availableParticipants[randomIndex]
}

const playWinningSound = () => {
  // 模拟中奖音效
  console.log('播放中奖音效')
  // 实际项目中可以使用 Audio 对象播放音效
  // const audio = new Audio('/assets/sounds/winning.mp3')
  // audio.play()
}
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--secondary-color);
}

.header nav {
  display: flex;
  gap: 20px;
}

.header nav a {
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.header nav a:hover {
  background-color: var(--primary-color);
  color: white;
}

.lottery-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 30px;
}

.lottery-mode h2,
.award-selection h2,
.lottery-results h2 {
  margin-bottom: 20px;
  color: var(--secondary-color);
  font-size: 20px;
}

.mode-buttons {
  display: flex;
  gap: 15px;
}

.mode-buttons button {
  padding: 10px 20px;
  border-radius: 4px;
  background-color: var(--card-color);
  color: var(--text-color);
  transition: all 0.3s ease;
  font-size: 16px;
}

.mode-buttons button:hover {
  background-color: var(--primary-color);
}

.mode-buttons button.active {
  background-color: var(--secondary-color);
  color: white;
}

.award-selection select {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  min-width: 300px;
}

.lottery-display {
  width: 100%;
  max-width: 800px;
  height: 400px;
  background-color: var(--card-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.lottery-wheel,
.lottery-scroll,
.lottery-specified {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-content,
.scroll-content,
.specified-content {
  text-align: center;
  padding: 40px;
}

.spinning-names {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.name-item {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  animation: fadeInOut 0.5s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

.scrolling-names {
  height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scrolling-names.spinning {
  animation: scrollUp 0.5s linear infinite;
}

@keyframes scrollUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-20px); }
}

.result {
  text-align: center;
}

.result h3 {
  font-size: 32px;
  color: var(--secondary-color);
  margin-bottom: 20px;
  animation: scaleIn 0.5s ease-in-out;
}

@keyframes scaleIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.winner-name {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.winner-id {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.placeholder h3 {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
}

.placeholder p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.award-info {
  margin-bottom: 30px;
}

.award-info h3 {
  font-size: 24px;
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.award-info p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.lottery-controls {
  display: flex;
  gap: 20px;
}

.control-button {
  padding: 15px 30px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.control-button.start {
  background-color: var(--secondary-color);
  color: white;
}

.control-button.start:hover:not(:disabled) {
  background-color: #d13753;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.control-button.stop {
  background-color: #ff9800;
  color: white;
}

.control-button.stop:hover:not(:disabled) {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.control-button.reset {
  background-color: var(--card-color);
  color: var(--text-color);
}

.control-button.reset:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.lottery-results {
  width: 100%;
  max-width: 800px;
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.result-rank {
  font-weight: bold;
  color: var(--secondary-color);
  min-width: 30px;
}

.result-name {
  flex: 1;
  margin-left: 20px;
}

.result-award {
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .lottery-container {
    padding: 20px;
    gap: 20px;
  }

  .mode-buttons {
    flex-direction: column;
    align-items: center;
  }

  .lottery-display {
    height: 300px;
  }

  .winner-name {
    font-size: 36px;
  }

  .lottery-controls {
    flex-direction: column;
    align-items: center;
  }

  .control-button {
    width: 200px;
    text-align: center;
  }
}
</style>