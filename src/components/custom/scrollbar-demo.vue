<template>
  <div class="scrollbar-demo">
    <div class="demo-title">
      <h2>自定义滚动条演示</h2>
      <p>一个完全自定义的滚动条组件，支持垂直、水平和双向滚动</p>
    </div>

    <div class="demo-grid">
      <!-- 垂直滚动演示 -->
      <div class="demo-card">
        <h3>垂直滚动</h3>
        <CustomScrollbar
          direction="vertical"
          :size="8"
          thumb-color="#4f46e5"
          track-color="rgba(79, 70, 229, 0.1)"
          :auto-hide="true"
          :smooth="true"
          max-height="300px"
          @scroll="handleScroll"
        >
          <div class="content">
            <div v-for="i in 50" :key="i" class="item">
              <span class="item-number">{{ i }}</span>
              <span class="item-text">这是第 {{ i }} 行内容，展示垂直滚动效果</span>
            </div>
          </div>
        </CustomScrollbar>
      </div>

      <!-- 水平滚动演示 -->
      <div class="demo-card">
        <h3>水平滚动</h3>
        <CustomScrollbar
          direction="horizontal"
          :size="8"
          thumb-color="#059669"
          track-color="rgba(5, 150, 105, 0.1)"
          :auto-hide="false"
          max-width="400px"
        >
          <div class="horizontal-content">
            <div v-for="i in 20" :key="i" class="horizontal-item">
              列 {{ i }}
            </div>
          </div>
        </CustomScrollbar>
      </div>

      <!-- 双向滚动演示 -->
      <div class="demo-card">
        <h3>双向滚动</h3>
        <CustomScrollbar
          direction="both"
          :size="10"
          thumb-color="#dc2626"
          track-color="rgba(220, 38, 38, 0.1)"
          :auto-hide="true"
          max-height="250px"
          max-width="400px"
        >
          <div class="both-content">
            <div v-for="row in 30" :key="row" class="row">
              <div v-for="col in 20" :key="col" class="cell">
                {{ row }}-{{ col }}
              </div>
            </div>
          </div>
        </CustomScrollbar>
      </div>

      <!-- 主题配置演示 -->
      <div class="demo-card">
        <h3>主题配置</h3>
        <div class="theme-controls">
          <div class="control-group">
            <label>滚动条大小:</label>
            <input
              v-model.number="themeConfig.size"
              type="range"
              min="4"
              max="20"
              class="slider"
            />
            <span>{{ themeConfig.size }}px</span>
          </div>

          <div class="control-group">
            <label>滚动条颜色:</label>
            <input
              v-model="themeConfig.thumbColor"
              type="color"
              class="color-picker"
            />
          </div>

          <div class="control-group">
            <label>轨道颜色:</label>
            <input
              v-model="themeConfig.trackColor"
              type="color"
              class="color-picker"
            />
          </div>

          <div class="control-group">
            <label>自动隐藏:</label>
            <input
              v-model="themeConfig.autoHide"
              type="checkbox"
              class="checkbox"
            />
          </div>

          <div class="control-group">
            <label>平滑滚动:</label>
            <input
              v-model="themeConfig.smooth"
              type="checkbox"
              class="checkbox"
            />
          </div>
        </div>

        <CustomScrollbar
          ref="customScrollbarRef"
          direction="vertical"
          :size="themeConfig.size"
          :thumb-color="themeConfig.thumbColor"
          :track-color="themeConfig.trackColor"
          :auto-hide="themeConfig.autoHide"
          :smooth="themeConfig.smooth"
          max-height="200px"
        >
          <div class="theme-content">
            <div v-for="i in 30" :key="i" class="theme-item">
              <span class="theme-icon">🎨</span>
              <span>自定义主题项目 {{ i }}</span>
            </div>
          </div>
        </CustomScrollbar>

        <div class="action-buttons">
          <button @click="scrollToTop" class="btn btn-primary">
            滚动到顶部
          </button>
          <button @click="scrollToBottom" class="btn btn-secondary">
            滚动到底部
          </button>
        </div>
      </div>
    </div>

    <!-- 滚动信息显示 -->
    <div class="scroll-info">
      <h3>滚动信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">滚动位置 (Top):</span>
          <span class="info-value">{{ scrollInfo.scrollTop }}px</span>
        </div>
        <div class="info-item">
          <span class="info-label">滚动位置 (Left):</span>
          <span class="info-value">{{ scrollInfo.scrollLeft }}px</span>
        </div>
        <div class="info-item">
          <span class="info-label">内容高度:</span>
          <span class="info-value">{{ scrollInfo.scrollHeight }}px</span>
        </div>
        <div class="info-item">
          <span class="info-label">内容宽度:</span>
          <span class="info-value">{{ scrollInfo.scrollWidth }}px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import CustomScrollbar from './custom-scrollbar.vue';

defineOptions({ name: 'ScrollbarDemo' });

// 自定义滚动条引用
const customScrollbarRef = ref<InstanceType<typeof CustomScrollbar>>();

// 主题配置
const themeConfig = reactive({
  size: 8,
  thumbColor: '#6366f1',
  trackColor: 'rgba(99, 102, 241, 0.1)',
  autoHide: true,
  smooth: true
});

// 滚动信息
const scrollInfo = reactive({
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 0,
  scrollWidth: 0
});

// 处理滚动事件
const handleScroll = (info: typeof scrollInfo) => {
  Object.assign(scrollInfo, info);
};

// 滚动到顶部
const scrollToTop = () => {
  customScrollbarRef.value?.scrollToTop();
};

// 滚动到底部
const scrollToBottom = () => {
  customScrollbarRef.value?.scrollToBottom();
};
</script>

<style scoped>
.scrollbar-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  text-align: center;
  margin-bottom: 32px;
}

.demo-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.demo-title p {
  font-size: 16px;
  color: #6b7280;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.demo-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.content {
  padding: 16px;
}

.item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.item:hover {
  background-color: #f9fafb;
}

.item-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #e5e7eb;
  color: #374151;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
}

.item-text {
  color: #4b5563;
}

.horizontal-content {
  display: flex;
  gap: 16px;
  padding: 16px;
  width: max-content;
}

.horizontal-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 80px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
}

.both-content {
  width: max-content;
}

.row {
  display: flex;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  color: #374151;
  font-size: 12px;
}

.cell:nth-child(even) {
  background-color: #ffffff;
}

.theme-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
}

.slider {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

.color-picker {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

.theme-content {
  padding: 16px;
}

.theme-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.theme-item:hover {
  background-color: #f9fafb;
}

.theme-icon {
  margin-right: 12px;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
}

.btn-primary:hover {
  background-color: #5856eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.scroll-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.scroll-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  font-weight: 600;
  color: #6366f1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .theme-controls {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .demo-card,
  .scroll-info {
    background-color: #1f2937;
    border-color: #374151;
  }

  .demo-title h2,
  .demo-card h3,
  .scroll-info h3 {
    color: #f9fafb;
  }

  .demo-title p {
    color: #d1d5db;
  }

  .item,
  .theme-item {
    border-color: #374151;
  }

  .item:hover,
  .theme-item:hover {
    background-color: #374151;
  }

  .item-text {
    color: #d1d5db;
  }

  .cell {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .cell:nth-child(even) {
    background-color: #1f2937;
  }

  .theme-controls {
    background-color: #374151;
  }

  .control-group label,
  .info-label {
    color: #f9fafb;
  }

  .info-item {
    background-color: #374151;
  }
}
</style>
