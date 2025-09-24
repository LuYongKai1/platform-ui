<script setup lang="ts">
import { ref, watch, computed } from 'vue';

defineOptions({
  name: 'TimeSlider'
});

interface Props {
  timePoints: string[];
  disabled?: boolean;
}

interface Emits {
  (e: 'update:startIndex', value: number): void;
  (e: 'update:endIndex', value: number): void;
  (e: 'change', value: { startIndex: number; endIndex: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<Emits>();

// 时间区间选择相关状态
const startTimeIndex = ref<number>(0);
const endTimeIndex = ref<number>(0);

// 计算滑动条进度百分比
const startSliderProgress = computed(() => {
  if (props.timePoints.length <= 1) return 0;
  return (startTimeIndex.value / (props.timePoints.length - 1)) * 100;
});

const endSliderProgress = computed(() => {
  if (props.timePoints.length <= 1) return 100;
  return (endTimeIndex.value / (props.timePoints.length - 1)) * 100;
});

// 计算选中的时间区间文本
const selectedTimeRange = computed(() => {
  if (props.timePoints.length === 0) return '';
  const startTime = props.timePoints[startTimeIndex.value]?.split(' ').pop() || '';
  const endTime = props.timePoints[endTimeIndex.value]?.split(' ').pop() || '';
  return startTime === endTime ? startTime : `${startTime} - ${endTime}`;
});

// 时间轴导航函数
const selectPreviousTime = () => {
  if (props.disabled) return;
  if (startTimeIndex.value > 0) {
    startTimeIndex.value--;
    // 如果开始时间超过了结束时间，也调整结束时间
    if (startTimeIndex.value > endTimeIndex.value) {
      endTimeIndex.value = startTimeIndex.value;
    }
  }
};

const selectNextTime = () => {
  if (props.disabled) return;
  if (endTimeIndex.value < props.timePoints.length - 1) {
    endTimeIndex.value++;
    // 如果结束时间超前太多，也调整开始时间
    if (endTimeIndex.value - startTimeIndex.value > 10) {
      startTimeIndex.value = Math.max(0, endTimeIndex.value - 10);
    }
  }
};

// 区间调整函数
const adjustStartTime = (newIndex: number) => {
  if (props.disabled) return;
  startTimeIndex.value = Math.max(0, Math.min(newIndex, endTimeIndex.value));
};

const adjustEndTime = (newIndex: number) => {
  if (props.disabled) return;
  endTimeIndex.value = Math.max(startTimeIndex.value, Math.min(newIndex, props.timePoints.length - 1));
};

// 初始化时间索引
const initializeTimeIndexes = () => {
  if (props.timePoints.length === 0) return;

  // 确保选择的时间索引有效
  if (startTimeIndex.value >= props.timePoints.length) {
    startTimeIndex.value = props.timePoints.length - 1;
  }
  if (endTimeIndex.value >= props.timePoints.length) {
    endTimeIndex.value = props.timePoints.length - 1;
  }

  // 如果还没有初始化，设置默认区间
  if (endTimeIndex.value === 0 && props.timePoints.length > 1) {
    startTimeIndex.value = Math.max(0, props.timePoints.length - 5); // 默认选择最近5个时间点
    endTimeIndex.value = props.timePoints.length - 1;
  }

  // 确保开始时间不晚于结束时间
  if (startTimeIndex.value > endTimeIndex.value) {
    startTimeIndex.value = endTimeIndex.value;
  }
};

// 监听器
watch([startTimeIndex, endTimeIndex], ([newStart, newEnd]) => {
  emit('update:startIndex', newStart);
  emit('update:endIndex', newEnd);
  emit('change', { startIndex: newStart, endIndex: newEnd });
});

// 添加额外的监听器来确保区间约束
watch(startTimeIndex, (newStart) => {
  if (newStart > endTimeIndex.value) {
    endTimeIndex.value = newStart;
  }
});

watch(endTimeIndex, (newEnd) => {
  if (newEnd < startTimeIndex.value) {
    startTimeIndex.value = newEnd;
  }
});

// 监听timePoints变化，重新初始化
watch(() => props.timePoints, () => {
  initializeTimeIndexes();
}, { immediate: true });

// 暴露方法给父组件
defineExpose({
  selectPreviousTime,
  selectNextTime,
  adjustStartTime,
  adjustEndTime,
  startTimeIndex: computed(() => startTimeIndex.value),
  endTimeIndex: computed(() => endTimeIndex.value),
  selectedTimeRange
});
</script>

<script lang="ts">
export default {
  name: 'TimeSlider'
};
</script>

<template>
  <div class="timeline-container" v-if="timePoints.length > 0">
    <div class="timeline-wrapper">
      <button
        class="timeline-nav-btn"
        @click="selectPreviousTime"
        :disabled="disabled || startTimeIndex <= 0"
      >
        ‹
      </button>

      <div class="timeline-slider-wrapper">
        <div class="timeline-track">
          <!-- 开始时间滑动条 -->
          <input
            type="range"
            class="timeline-slider start-slider"
            v-model="startTimeIndex"
            :min="0"
            :max="timePoints.length - 1"
            :step="1"
            :disabled="disabled"
          />
          <!-- 结束时间滑动条 -->
          <input
            type="range"
            class="timeline-slider end-slider"
            v-model="endTimeIndex"
            :min="0"
            :max="timePoints.length - 1"
            :step="1"
            :disabled="disabled"
          />
          <!-- 区间高亮显示 -->
          <div class="timeline-range"
               :style="{
                 left: startSliderProgress + '%',
                 width: (endSliderProgress - startSliderProgress) + '%'
               }">
          </div>
          <div class="timeline-labels">
            <span class="timeline-label start">{{ timePoints[0]?.split(' ').pop() || '' }}</span>
            <span class="timeline-label current">{{ selectedTimeRange }}</span>
            <span class="timeline-label end">{{ timePoints[timePoints.length - 1]?.split(' ').pop() || '' }}</span>
          </div>
        </div>
      </div>

      <button
        class="timeline-nav-btn"
        @click="selectNextTime"
        :disabled="disabled || endTimeIndex >= timePoints.length - 1"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style scoped>
.timeline-container {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-nav-btn {
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #666;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.timeline-nav-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  color: #1890ff;
}

.timeline-nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.timeline-slider-wrapper {
  flex: 1;
}

.timeline-track {
  position: relative;
  height: 20px;
}

.timeline-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: transparent;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  position: absolute;
  top: 8px;
  z-index: 2;
}

.timeline-slider:disabled {
  cursor: not-allowed;
}

.timeline-slider:first-of-type {
  background: #e8e8e8;
}

.timeline-slider.start-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #52c41a;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.timeline-slider.end-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #1890ff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.timeline-slider::-webkit-slider-thumb:hover:not(:disabled) {
  transform: scale(1.15);
}

.timeline-slider:disabled::-webkit-slider-thumb {
  background: #ccc;
  cursor: not-allowed;
}

.timeline-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #1890ff;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #fff;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.timeline-slider.start-slider::-moz-range-thumb {
  background: #52c41a;
}

.timeline-slider::-moz-range-thumb:hover:not(:disabled) {
  transform: scale(1.15);
}

.timeline-slider::-moz-range-track {
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  border: none;
}

.timeline-range {
  position: absolute;
  top: 8px;
  height: 4px;
  background: linear-gradient(90deg, #52c41a, #1890ff);
  border-radius: 2px;
  z-index: 1;
  transition: all 0.3s ease;
}

.timeline-labels {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.timeline-label {
  padding: 4px 8px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.timeline-label.current {
  color: #1890ff;
  font-weight: 500;
}
</style>
