<template>
  <div class="home">
    <!-- 春节主题背景元素 -->
    <div class="spring-festival-bg">
      <!-- 红灯笼 -->
      <div class="lantern lantern-left">
        <div class="lantern-body">
          <div class="lantern-text">福</div>
        </div>
        <div class="lantern-tassel"></div>
      </div>
      <div class="lantern lantern-right">
        <div class="lantern-body">
          <div class="lantern-text">春</div>
        </div>
        <div class="lantern-tassel"></div>
      </div>
      
      <!-- 中国结 -->
      <div class="chinese-knot knot-left">🧧</div>
      <div class="chinese-knot knot-right">🧧</div>
      
      <!-- 烟花效果 -->
      <div class="fireworks">
        <div class="firework" v-for="n in 5" :key="n" :style="getFireworkStyle(n)"></div>
      </div>
      
      <!-- 飘落的福字 -->
      <div class="floating-fu">
        <div class="fu-item" v-for="n in 8" :key="n" :style="getFuStyle(n)">福</div>
      </div>
      
      <!-- 背景装饰 -->
      <div class="bg-pattern"></div>
    </div>

    <!-- 顶部标题 -->
    <header class="header">
      <div class="title-decoration">
        <span class="decoration-item">🏮</span>
        <h1>2025年终汇报抽奖</h1>
        <span class="decoration-item">🏮</span>
      </div>
      <nav>
        <router-link to="/admin">管理面板</router-link>
      </nav>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 左侧抽奖区域 -->
      <div class="lottery-section">
        <!-- 奖项等级选择 -->
        <div class="award-level-selection">
          <h2>🎁 选择奖项等级</h2>
          <div class="level-buttons">
            <button 
              v-for="level in awardLevels" 
              :key="level.value"
              :class="{ active: selectedLevel === level.value }"
              @click="selectLevel(level.value)"
              :disabled="isSpinning"
            >
              {{ level.label }}
            </button>
          </div>
        </div>

        <!-- 具体奖品选择 -->
        <div class="prize-selection">
          <h3>🎊 选择具体奖品</h3>
          <div class="prize-list">
            <div 
              v-for="prize in availablePrizes" 
              :key="prize.id"
              class="prize-item"
              :class="{ active: selectedPrize === prize.id, disabled: prize.remaining === 0 }"
              @click="selectPrize(prize)"
            >
              <div class="prize-name">{{ prize.name }}</div>
              <div class="prize-count">
                剩余: {{ prize.remaining }} / {{ prize.count }}
              </div>
            </div>
            <div v-if="availablePrizes.length === 0" class="prize-empty">
              <div class="prize-empty-icon">🎁</div>
              <p v-if="!selectedLevel">请先选择奖项等级</p>
              <p v-else>当前奖项等级暂无可用奖品</p>
            </div>
          </div>
        </div>

        <!-- 抽奖显示区域 -->
        <div class="lottery-display" :class="{ 'has-result': currentResult }">
          <div class="display-content">
            <!-- 滚动效果 -->
            <div class="spinning-container" v-if="isSpinning">
              <div class="spinning-names">
                <div v-for="(name, index) in spinningNames" :key="index" class="name-item">
                  {{ name }}
                </div>
              </div>
            </div>
            <!-- 中奖结果 -->
            <div class="result-container" v-else-if="currentResult">
              <div class="result-badge">🎉 恭喜中奖 🎉</div>
              <div class="winner-info">
                <div class="winner-name">{{ currentResult.name }}</div>
              </div>
            </div>
            
            <!-- 初始状态 -->
            <div class="placeholder" v-else>
              <div class="placeholder-icon">🎲</div>
              <h3>请选择奖项开始抽奖</h3>
              <p>祝您好运！</p>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="lottery-controls">
          <button 
            class="control-button start" 
            @click="startLottery"
            :disabled="isSpinning || !canStartLottery"
          >
            <span class="button-icon">🎯</span>
            {{ isSpinning ? '抽奖中...' : '开始抽奖' }}
          </button>
          <button 
            class="control-button stop" 
            @click="stopLottery"
            :disabled="!isSpinning"
          >
            <span class="button-icon">✋</span>
            停止抽奖
          </button>
          <button 
            class="control-button reset" 
            @click="resetLottery"
            :disabled="isSpinning"
          >
            <span class="button-icon">🔄</span>
            重置
          </button>
        </div>

        <!-- 剩余参与人数 -->
        <div class="participants-info">
          <div class="info-item">
            <span class="info-label">剩余参与人数:</span>
            <span class="info-value">{{ availableParticipants.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">已中奖人数:</span>
            <span class="info-value">{{ history.length }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧中奖结果展示 -->
      <div class="results-section">
        <div class="results-panel">
          <div class="results-header">
            <h2>🏆 中奖榜单</h2>
            <div class="results-count">共 {{ history.length }} 人</div>
          </div>
          
          <div class="results-list" v-if="history.length > 0">
            <div 
              v-for="(result, index) in sortedHistory" 
              :key="result.id" 
              class="result-card"
              :class="getLevelClass(result.level)"
            >
              <div class="result-rank">{{ index + 1 }}</div>
              <div class="result-content">
                <div class="result-winner">
                  <span class="winner-name-small">{{ result.participantName }}</span>
                  <span class="winner-id-small">{{ result.participantId }}</span>
                </div>
                <div class="result-prize">
                  <span class="prize-level-badge">{{ result.levelName }}</span>
                  <span class="prize-name-small">{{ result.prizeName }}</span>
                </div>
              </div>
              <div class="result-time">{{ formatTime(result.timestamp) }}</div>
            </div>
          </div>
          
          <div class="empty-results" v-else>
            <div class="empty-icon">🎊</div>
            <p>暂无中奖记录</p>
            <p class="empty-hint">开始抽奖吧！</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const selectedLevel = ref('') // 选择的奖项等级
const selectedPrize = ref('') // 选择的具体奖品
const isSpinning = ref(false) // 是否正在抽奖
const currentResult = ref(null) // 当前抽奖结果
const spinningNames = ref([]) // 滚动显示的名字
const spinningInterval = ref(null) // 滚动定时器

// 从本地存储获取数据
const participants = ref([]) // 参与者列表
const awards = ref([]) // 奖项列表
const history = ref([]) // 历史记录

// 奖项等级配置（与后台管理保持一致）
const awardLevels = [
  { label: '一等奖', value: 'first', color: '#FF6B6B' },
  { label: '二等奖', value: 'second', color: '#4ECDC4' },
  { label: '三等奖', value: 'third', color: '#45B7D1' },
  { label: '幸运奖', value: 'lucky', color: '#96CEB4' }
]

// 计算属性
const availableParticipants = computed(() => {
  const winnerIds = history.value.map(h => h.participantId)
  return participants.value.filter(p => !winnerIds.includes(p.id))
})

const canStartLottery = computed(() => {
  if (availableParticipants.value.length === 0) return false
  if (!selectedLevel.value) return false
  if (!selectedPrize.value) return false
  return true
})

const availablePrizes = computed(() => {
  if (!selectedLevel.value) return []
  
  return awards.value
    .filter(award => {
      // 根据奖项名称匹配等级
      const awardName = award.name.toLowerCase()
      switch (selectedLevel.value) {
        case 'first':
          return awardName.includes('一等奖') || awardName.includes('1等奖')
        case 'second':
          return awardName.includes('二等奖') || awardName.includes('2等奖')
        case 'third':
          return awardName.includes('三等奖') || awardName.includes('3等奖')
        case 'lucky':
          return awardName.includes('幸运奖')
        default:
          return false
      }
    })
    .map(award => {
      const usedCount = history.value.filter(h => h.awardId === award.id).length
      let level = selectedLevel.value
      let levelName = awardLevels.find(l => l.value === level)?.label || level
      
      return {
        ...award,
        level,
        remaining: Math.max(0, award.count - usedCount),
        levelName
      }
    })
    .sort((a, b) => b.remaining - a.remaining)
})

const selectedPrizeInfo = computed(() => {
  if (!selectedPrize.value) return null
  return availablePrizes.value.find(p => p.id === selectedPrize.value)
})

const sortedHistory = computed(() => {
  return [...history.value].reverse()
})

// 生命周期
onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (spinningInterval.value) {
    clearInterval(spinningInterval.value)
  }
})

// 方法
const loadData = () => {
  try {
    const savedParticipants = localStorage.getItem('participants')
    const savedAwards = localStorage.getItem('awards')
    const savedHistory = localStorage.getItem('history')
    
    if (savedParticipants) {
      participants.value = JSON.parse(savedParticipants)
    }
    if (savedAwards) {
      awards.value = JSON.parse(savedAwards)
    }
    if (savedHistory) {
      history.value = JSON.parse(savedHistory)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const selectLevel = (level) => {
  selectedLevel.value = level
  selectedPrize.value = ''
  currentResult.value = null
}

const selectPrize = (prize) => {
  if (prize.remaining === 0 || isSpinning.value) return
  selectedPrize.value = prize.id
  currentResult.value = null
}

const startLottery = () => {
  if (!canStartLottery.value) return
  
  isSpinning.value = true
  currentResult.value = null
  
  // 生成滚动名字
  generateSpinningNames()
  
  // 开始滚动动画
  spinningInterval.value = setInterval(() => {
    generateSpinningNames()
  }, 80)
}

const stopLottery = () => {
  if (!isSpinning.value) return
  
  isSpinning.value = false
  
  // 停止滚动动画
  if (spinningInterval.value) {
    clearInterval(spinningInterval.value)
    spinningInterval.value = null
  }
  
  // 生成抽奖结果
  generateLotteryResult()
}

const resetLottery = () => {
  isSpinning.value = false
  currentResult.value = null
  spinningNames.value = []
  selectedLevel.value = ''
  selectedPrize.value = ''
  
  if (spinningInterval.value) {
    clearInterval(spinningInterval.value)
    spinningInterval.value = null
  }
}

const generateSpinningNames = () => {
  const names = availableParticipants.value.map(p => p.name)
  if (names.length === 0) return
  
  const spinning = []
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * names.length)
    spinning.push(names[randomIndex])
  }
  spinningNames.value = spinning
}

const generateLotteryResult = () => {
  if (availableParticipants.value.length === 0) {
    alert('所有参与者都已中奖！')
    return
  }
  
  // 随机选择中奖者
  const randomIndex = Math.floor(Math.random() * availableParticipants.value.length)
  const winner = availableParticipants.value[randomIndex]
  const prize = selectedPrizeInfo.value
  
  if (!prize) {
    alert('奖品信息错误！')
    return
  }
  
  // 生成抽奖记录
  const lotteryRecord = {
    id: Date.now().toString(),
    participantId: winner.id,
    participantName: winner.name,
    awardId: prize.id,
    prizeName: prize.name,
    level: prize.level,
    levelName: prize.levelName,
    timestamp: new Date().toISOString()
  }
  
  // 更新本地存储
  history.value.push(lotteryRecord)
  localStorage.setItem('history', JSON.stringify(history.value))
  
  // 更新当前结果
  currentResult.value = {
    ...winner,
    prizeName: prize.name,
    levelName: prize.levelName
  }
  
  // 播放中奖音效
  playWinningSound()
}

const getLevelClass = (level) => {
  const classMap = {
    'special': 'level-special',
    'first': 'level-first',
    'second': 'level-second',
    'third': 'level-third',
    'lucky': 'level-lucky'
  }
  return classMap[level] || ''
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const playWinningSound = () => {
  console.log('🎉 播放中奖音效')
}

// 春节主题动画样式
const getFireworkStyle = (n) => {
  const positions = [
    { left: '10%', top: '20%' },
    { left: '85%', top: '15%' },
    { left: '20%', top: '60%' },
    { left: '75%', top: '50%' },
    { left: '50%', top: '30%' }
  ]
  const delays = ['0s', '0.5s', '1s', '1.5s', '2s']
  const pos = positions[(n - 1) % positions.length]
  return {
    left: pos.left,
    top: pos.top,
    animationDelay: delays[(n - 1) % delays.length]
  }
}

const getFuStyle = (n) => {
  const left = (n - 1) * 12 + 5
  const delay = (n - 1) * 0.8
  const duration = 8 + Math.random() * 4
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #8B0000 100%);
  color: #FFD700;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 春节主题背景 */
.spring-festival-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 红灯笼 */
.lantern {
  position: absolute;
  top: 20px;
  width: 80px;
  height: 120px;
  animation: swing 3s ease-in-out infinite;
}

.lantern-left {
  left: 30px;
}

.lantern-right {
  right: 30px;
  animation-delay: 1.5s;
}

.lantern-body {
  width: 80px;
  height: 100px;
  background: linear-gradient(180deg, #FF0000 0%, #CC0000 100%);
  border-radius: 40px 40px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(255, 200, 0, 0.3);
  border: 3px solid #FFD700;
}

.lantern-text {
  font-size: 40px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.lantern-tassel {
  width: 4px;
  height: 30px;
  background: #FFD700;
  margin: 0 auto;
  position: relative;
}

.lantern-tassel::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: -8px;
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
}

@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* 中国结 */
.chinese-knot {
  position: absolute;
  font-size: 40px;
  animation: pulse 2s ease-in-out infinite;
}

.knot-left {
  left: 120px;
  top: 80px;
}

.knot-right {
  right: 120px;
  top: 80px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 烟花效果 */
.fireworks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.firework {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: firework 3s ease-out infinite;
}

.firework::before,
.firework::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: firework 3s ease-out infinite;
}

.firework:nth-child(1) { background: #FFD700; box-shadow: 0 0 10px #FFD700; }
.firework:nth-child(2) { background: #FF69B4; box-shadow: 0 0 10px #FF69B4; }
.firework:nth-child(3) { background: #00CED1; box-shadow: 0 0 10px #00CED1; }
.firework:nth-child(4) { background: #FF6347; box-shadow: 0 0 10px #FF6347; }
.firework:nth-child(5) { background: #7FFF00; box-shadow: 0 0 10px #7FFF00; }

@keyframes firework {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(20);
    opacity: 0.5;
  }
  100% {
    transform: scale(40);
    opacity: 0;
  }
}

/* 飘落的福字 */
.floating-fu {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.fu-item {
  position: absolute;
  top: -50px;
  font-size: 30px;
  color: rgba(255, 215, 0, 0.6);
  animation: fall linear infinite;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes fall {
  0% {
    transform: translateY(-50px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* 背景图案 */
.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 0, 0, 0.2) 0%, transparent 30%);
  pointer-events: none;
}

/* 顶部标题 */
.header {
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #FFD700;
  position: relative;
  z-index: 10;
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 20px;
}

.decoration-item {
  font-size: 30px;
  animation: bounce 1s ease-in-out infinite;
}

.decoration-item:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header h1 {
  font-size: 32px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 8px;
}

.header nav {
  display: flex;
  gap: 20px;
}

.header nav a {
  color: #FFD700;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 25px;
  border: 2px solid #FFD700;
  transition: all 0.3s ease;
  font-weight: bold;
}

.header nav a:hover {
  background: #FFD700;
  color: #8B0000;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px;
  gap: 30px;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

/* 左侧抽奖区域 */
.lottery-section {
  flex: 0 0 auto;
  width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 奖项等级选择 */
.award-level-selection {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  padding: 15px;
  border: 2px solid #FFD700;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.award-level-selection h2 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #FFD700;
  text-align: center;
  line-height: 1.2;
}

.level-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.level-buttons button {
  padding: 10px 20px;
  border-radius: 20px;
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
  border: 2px solid #FFD700;
  font-size: 15px;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}

.level-buttons button:hover:not(:disabled) {
  background: #FFD700;
  color: #8B0000;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.level-buttons button.active {
  background: #FFD700;
  color: #8B0000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.level-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 奖品选择 */
.prize-selection {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  padding: 15px;
  border: 2px solid #FFD700;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.prize-selection h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #FFD700;
  text-align: center;
  line-height: 1.2;
}

.prize-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.prize-item {
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.prize-item:hover:not(.disabled) {
  background: rgba(255, 215, 0, 0.3);
  border-color: #FFD700;
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
}

.prize-item.active {
  background: #FFD700;
  border-color: #FFD700;
  color: #8B0000;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
}

.prize-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(128, 128, 128, 0.2);
}

.prize-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.prize-count {
  font-size: 14px;
  opacity: 0.9;
}

/* 奖品空状态样式 */
.prize-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 1px;
  text-align: center;
  color: rgba(255, 215, 0, 0.6);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 2px dashed rgba(255, 215, 0, 0.3);
}

.prize-empty-icon {
  font-size: 27px;
  margin-bottom: 2px;
  opacity: 0.6;
}

.prize-empty p {
  margin: 3px 0;
  font-size: 16px;
  line-height: 1.4;
}

.prize-empty p:first-of-type {
  font-weight: 500;
  margin-bottom: 10px;
}

/* 抽奖显示区域 */
.lottery-display {
  flex: 1;
  min-height: 300px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  border: 3px solid #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
}

.lottery-display::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 215, 0, 0.1) 50%,
    transparent 70%
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

.display-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 40px;
}

/* 滚动效果 */
.spinning-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinning-names {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.name-item {
  font-size: 28px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: nameFlash 0.1s ease-in-out;
}

@keyframes nameFlash {
  0% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

/* 中奖结果 */
.result-container {
  text-align: center;
  animation: resultAppear 0.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

@keyframes resultAppear {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.result-badge {
  font-size: 28px;
  color: #FFD700;
  margin-bottom: 30px;
  animation: badgePulse 1s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.winner-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.winner-name {
  font-size: 64px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.7);
  animation: winnerGlow 2s ease-in-out infinite;
  margin: 0;
}

@keyframes winnerGlow {
  0%, 100% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.7); }
  50% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 215, 0, 1); }
}

.winner-detail {
  display: flex;
  gap: 20px;
  justify-content: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 15px;
}

/* 初始状态 */
.placeholder {
  text-align: center;
}

.placeholder-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.placeholder h3 {
  font-size: 24px;
  color: #FFD700;
  margin-bottom: 10px;
}

.placeholder p {
  font-size: 16px;
  color: rgba(255, 215, 0, 0.7);
}

/* 控制按钮 */
.lottery-controls {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.control-button {
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-icon {
  font-size: 20px;
}

.control-button.start {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #8B0000;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.control-button.start:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
}

.control-button.stop {
  background: linear-gradient(135deg, #FF6347 0%, #DC143C 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 99, 71, 0.4);
}

.control-button.stop:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(255, 99, 71, 0.6);
}

.control-button.reset {
  background: rgba(255, 255, 255, 0.2);
  color: #FFD700;
  border: 2px solid #FFD700;
}

.control-button.reset:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.3);
  transform: translateY(-3px);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 参与人数信息 */
.participants-info {
  display: flex;
  gap: 30px;
  justify-content: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 14px;
  color: rgba(255, 215, 0, 0.8);
}

.info-value {
  font-size: 20px;
  font-weight: bold;
  color: #FFD700;
}

/* 右侧中奖结果区域 */
.results-section {
  flex: 0 0 auto;
  width: 300px;
  height: 600px;
}

.results-panel {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  border: 3px solid #FFD700;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
}

.results-header {
  padding: 20px;
  background: rgba(255, 215, 0, 0.2);
  border-bottom: 2px solid #FFD700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h2 {
  font-size: 20px;
  color: #FFD700;
}

.results-count {
  font-size: 14px;
  color: rgba(255, 215, 0, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 12px;
  border-radius: 15px;
}

.results-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-list::-webkit-scrollbar {
  width: 6px;
}

.results-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.results-list::-webkit-scrollbar-thumb {
  background: #FFD700;
  border-radius: 3px;
}

.result-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 4px solid #FFD700;
  transition: all 0.3s ease;
}

.result-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.result-card.level-special { border-left-color: #FFD700; }
.result-card.level-first { border-left-color: #FF6B6B; }
.result-card.level-second { border-left-color: #4ECDC4; }
.result-card.level-third { border-left-color: #45B7D1; }
.result-card.level-lucky { border-left-color: #96CEB4; }

.result-rank {
  width: 28px;
  height: 28px;
  background: #FFD700;
  color: #8B0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-winner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.winner-name-small {
  font-weight: bold;
  color: #FFD700;
  font-size: 15px;
}

.winner-id-small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.result-prize {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prize-level-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 215, 0, 0.3);
  color: #FFD700;
}

.prize-name-small {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.result-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

.empty-results p {
  color: rgba(255, 215, 0, 0.7);
  margin-bottom: 10px;
}

.empty-hint {
  font-size: 14px;
  color: rgba(255, 215, 0, 0.5);
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .lottery-section {
    max-width: 100%;
  }
  
  .results-section {
    width: 100%;
    min-width: auto;
  }
}

@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .main-content {
    padding: 15px;
  }
  
  .level-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .level-buttons button {
    width: 150px;
  }
  
  .prize-list {
    grid-template-columns: 1fr;
  }
  
  .lottery-display {
    min-height: 250px;
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
    justify-content: center;
  }
  
  .lantern {
    width: 50px;
    height: 80px;
  }
  
  .lantern-body {
    width: 50px;
    height: 65px;
  }
  
  .lantern-text {
    font-size: 24px;
  }
}
</style>