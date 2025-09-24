<template>
  <div
    ref="scrollbarRef"
    class="custom-scrollbar"
    :class="{
      'scrollbar-horizontal': direction === 'horizontal',
      'scrollbar-vertical': direction === 'vertical',
      'scrollbar-both': direction === 'both'
    }"
    @mouseenter="showScrollbar = true"
    @mouseleave="showScrollbar = false"
  >
    <!-- 内容区域 -->
    <div
      ref="contentRef"
      class="scrollbar-content"
      :style="contentStyle"
      @scroll="handleScroll"
    >
      <slot></slot>
    </div>

    <!-- 垂直滚动条 -->
    <div
      v-if="direction === 'vertical' || direction === 'both'"
      class="scrollbar-track scrollbar-track-vertical"
      :class="{ 'scrollbar-visible': showScrollbar || isDragging }"
      @mousedown="handleTrackClick($event, 'vertical')"
    >
      <div
        ref="thumbVerticalRef"
        class="scrollbar-thumb scrollbar-thumb-vertical"
        :style="verticalThumbStyle"
        @mousedown="handleThumbMouseDown($event, 'vertical')"
      ></div>
    </div>

    <!-- 水平滚动条 -->
    <div
      v-if="direction === 'horizontal' || direction === 'both'"
      class="scrollbar-track scrollbar-track-horizontal"
      :class="{ 'scrollbar-visible': showScrollbar || isDragging }"
      @mousedown="handleTrackClick($event, 'horizontal')"
    >
      <div
        ref="thumbHorizontalRef"
        class="scrollbar-thumb scrollbar-thumb-horizontal"
        :style="horizontalThumbStyle"
        @mousedown="handleThumbMouseDown($event, 'horizontal')"
      ></div>
    </div>

    <!-- 角落区域（当同时有水平和垂直滚动条时） -->
    <div
      v-if="direction === 'both'"
      class="scrollbar-corner"
      :class="{ 'scrollbar-visible': showScrollbar || isDragging }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';

defineOptions({ name: 'CustomScrollbar' });

type ScrollDirection = 'vertical' | 'horizontal' | 'both';

interface Props {
  /** 滚动方向 */
  direction?: ScrollDirection;
  /** 滚动条宽度/高度 */
  size?: number;
  /** 滚动条颜色 */
  thumbColor?: string;
  /** 滚动轨道颜色 */
  trackColor?: string;
  /** 自动隐藏滚动条 */
  autoHide?: boolean;
  /** 平滑滚动 */
  smooth?: boolean;
  /** 最大高度 */
  maxHeight?: string;
  /** 最大宽度 */
  maxWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'vertical',
  size: 8,
  thumbColor: '#c1c1c1',
  trackColor: 'transparent',
  autoHide: true,
  smooth: true,
  maxHeight: '100%',
  maxWidth: '100%'
});

const emit = defineEmits<{
  scroll: [{ scrollTop: number; scrollLeft: number; scrollHeight: number; scrollWidth: number }];
}>();

// 响应式引用
const scrollbarRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const thumbVerticalRef = ref<HTMLElement>();
const thumbHorizontalRef = ref<HTMLElement>();

// 状态管理
const showScrollbar = ref(!props.autoHide);
const isDragging = ref(false);
const scrollTop = ref(0);
const scrollLeft = ref(0);
const scrollHeight = ref(0);
const scrollWidth = ref(0);
const clientHeight = ref(0);
const clientWidth = ref(0);

// 拖拽状态
const dragState = ref({
  isDragging: false,
  direction: '' as 'vertical' | 'horizontal',
  startY: 0,
  startX: 0,
  startScrollTop: 0,
  startScrollLeft: 0
});

// 计算样式
const contentStyle = computed(() => ({
  maxHeight: props.maxHeight,
  maxWidth: props.maxWidth,
  scrollBehavior: props.smooth ? 'smooth' : 'auto'
}));

// 垂直滚动条拇指样式
const verticalThumbStyle = computed(() => {
  const thumbHeight = Math.max((clientHeight.value / scrollHeight.value) * clientHeight.value, 20);
  const thumbTop = (scrollTop.value / (scrollHeight.value - clientHeight.value)) * (clientHeight.value - thumbHeight);

  return {
    height: `${thumbHeight}px`,
    transform: `translateY(${thumbTop}px)`,
    backgroundColor: props.thumbColor,
    width: `${props.size}px`
  };
});

// 水平滚动条拇指样式
const horizontalThumbStyle = computed(() => {
  const thumbWidth = Math.max((clientWidth.value / scrollWidth.value) * clientWidth.value, 20);
  const thumbLeft = (scrollLeft.value / (scrollWidth.value - clientWidth.value)) * (clientWidth.value - thumbWidth);

  return {
    width: `${thumbWidth}px`,
    transform: `translateX(${thumbLeft}px)`,
    backgroundColor: props.thumbColor,
    height: `${props.size}px`
  };
});

// 处理滚动事件
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  scrollLeft.value = target.scrollLeft;
  scrollHeight.value = target.scrollHeight;
  scrollWidth.value = target.scrollWidth;
  clientHeight.value = target.clientHeight;
  clientWidth.value = target.clientWidth;

  emit('scroll', {
    scrollTop: scrollTop.value,
    scrollLeft: scrollLeft.value,
    scrollHeight: scrollHeight.value,
    scrollWidth: scrollWidth.value
  });
};

// 处理轨道点击
const handleTrackClick = (event: MouseEvent, direction: 'vertical' | 'horizontal') => {
  event.preventDefault();
  if (!contentRef.value) return;

  const rect = contentRef.value.getBoundingClientRect();

  if (direction === 'vertical') {
    const clickY = event.clientY - rect.top;
    const scrollRatio = clickY / clientHeight.value;
    const targetScrollTop = scrollRatio * (scrollHeight.value - clientHeight.value);
    contentRef.value.scrollTop = targetScrollTop;
  } else {
    const clickX = event.clientX - rect.left;
    const scrollRatio = clickX / clientWidth.value;
    const targetScrollLeft = scrollRatio * (scrollWidth.value - clientWidth.value);
    contentRef.value.scrollLeft = targetScrollLeft;
  }
};

// 处理拇指鼠标按下
const handleThumbMouseDown = (event: MouseEvent, direction: 'vertical' | 'horizontal') => {
  event.preventDefault();
  event.stopPropagation();

  dragState.value = {
    isDragging: true,
    direction,
    startY: event.clientY,
    startX: event.clientX,
    startScrollTop: scrollTop.value,
    startScrollLeft: scrollLeft.value
  };

  isDragging.value = true;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.body.style.userSelect = 'none';
};

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!dragState.value.isDragging || !contentRef.value) return;

  event.preventDefault();

  if (dragState.value.direction === 'vertical') {
    const deltaY = event.clientY - dragState.value.startY;
    const scrollRatio = deltaY / (clientHeight.value - 20); // 20是最小拇指高度
    const deltaScrollTop = scrollRatio * (scrollHeight.value - clientHeight.value);
    contentRef.value.scrollTop = dragState.value.startScrollTop + deltaScrollTop;
  } else {
    const deltaX = event.clientX - dragState.value.startX;
    const scrollRatio = deltaX / (clientWidth.value - 20); // 20是最小拇指宽度
    const deltaScrollLeft = scrollRatio * (scrollWidth.value - clientWidth.value);
    contentRef.value.scrollLeft = dragState.value.startScrollLeft + deltaScrollLeft;
  }
};

// 处理鼠标抬起
const handleMouseUp = () => {
  dragState.value.isDragging = false;
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.body.style.userSelect = '';
};

// 更新尺寸信息
const updateScrollInfo = () => {
  if (!contentRef.value) return;

  scrollHeight.value = contentRef.value.scrollHeight;
  scrollWidth.value = contentRef.value.scrollWidth;
  clientHeight.value = contentRef.value.clientHeight;
  clientWidth.value = contentRef.value.clientWidth;
  scrollTop.value = contentRef.value.scrollTop;
  scrollLeft.value = contentRef.value.scrollLeft;
};

// 公开的方法
const scrollTo = (options: { top?: number; left?: number; behavior?: 'smooth' | 'auto' }) => {
  if (!contentRef.value) return;
  contentRef.value.scrollTo(options);
};

const scrollToTop = () => {
  scrollTo({ top: 0, behavior: props.smooth ? 'smooth' : 'auto' });
};

const scrollToBottom = () => {
  scrollTo({ top: scrollHeight.value, behavior: props.smooth ? 'smooth' : 'auto' });
};

// 监听内容变化
const resizeObserver = ref<ResizeObserver>();

onMounted(() => {
  nextTick(() => {
    updateScrollInfo();

    // 监听内容尺寸变化
    if (contentRef.value) {
      resizeObserver.value = new ResizeObserver(() => {
        updateScrollInfo();
      });
      resizeObserver.value.observe(contentRef.value);
    }
  });
});

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
  handleMouseUp();
});

// 监听props变化
watch(() => props.autoHide, (newVal) => {
  showScrollbar.value = !newVal;
});

defineExpose({
  scrollTo,
  scrollToTop,
  scrollToBottom,
  updateScrollInfo
});
</script>

<style scoped>
.custom-scrollbar {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.scrollbar-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.scrollbar-content::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.scrollbar-track {
  position: absolute;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 4px;
}

.scrollbar-track.scrollbar-visible {
  opacity: 1;
}

.scrollbar-track-vertical {
  top: 0;
  right: 0;
  width: v-bind('props.size + "px"');
  height: 100%;
  background-color: v-bind('props.trackColor');
}

.scrollbar-track-horizontal {
  bottom: 0;
  left: 0;
  width: 100%;
  height: v-bind('props.size + "px"');
  background-color: v-bind('props.trackColor');
}

.scrollbar-thumb {
  position: absolute;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.scrollbar-thumb:hover {
  background-color: #a1a1aa !important;
}

.scrollbar-thumb:active {
  background-color: #71717a !important;
}

.scrollbar-thumb-vertical {
  top: 0;
  right: 0;
  min-height: 20px;
}

.scrollbar-thumb-horizontal {
  bottom: 0;
  left: 0;
  min-width: 20px;
}

.scrollbar-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: v-bind('props.size + "px"');
  height: v-bind('props.size + "px"');
  background-color: v-bind('props.trackColor');
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scrollbar-corner.scrollbar-visible {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scrollbar-track {
    width: 6px !important;
    height: 6px !important;
  }

  .scrollbar-thumb {
    border-radius: 3px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .scrollbar-thumb {
    background-color: #525252;
  }

  .scrollbar-thumb:hover {
    background-color: #404040 !important;
  }

  .scrollbar-thumb:active {
    background-color: #262626 !important;
  }
}
</style>
