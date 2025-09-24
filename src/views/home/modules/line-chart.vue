<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetLineChartData } from '@/service/api/system-manage';
import { NSpin } from 'naive-ui';

defineOptions({
  name: 'LineChart'
});

interface TrendPoint {
  online: number;
  time: string;
  day: string;
}

interface ServerData {
  trend: TrendPoint[];
  serverId: number;
  serverName: string;
}

const appStore = useAppStore();
// const loading = ref(true);
const hasError = ref(false);

// 当前选择的时间范围
const timeRange = ref<'1h' | '24h'>('1h');
// 存储完整数据
const fullData = ref<any>(null);
// 过滤后的数据
const filteredData = computed(() => {
  if (!fullData.value) return null;

  if (timeRange.value === '1h') {
    // 仅显示最近一小时的数据
    return filterLastHourData(fullData.value);
  } else {
    // 显示完整24小时数据
    return fullData.value;
  }
});

// 过滤最近一小时的数据
function filterLastHourData(data: any) {
  if (!data || !data.data || !Array.isArray(data.data)) return data;

  const result = { ...data };
  result.data = data.data.map((server: ServerData) => {
    const serverCopy = { ...server };

    // 获取所有时间点
    const allTimePoints = server.trend.map((point: TrendPoint) => point.time);

    // 只保留最后一小时的数据点（假设数据是按时间顺序排列的）
    // 如果数据点超过60个，只保留最新的60个（每分钟一个数据点）
    const lastHourCount = Math.min(60, allTimePoints.length);
    const lastHourPoints = server.trend.slice(-lastHourCount);

    serverCopy.trend = lastHourPoints;
    return serverCopy;
  });

  return result;
}

// 预设的服务器颜色 - 更优雅的渐变配色
const serverColors = [
  {
    light: 'rgba(24, 144, 255, 0.7)',
    dark: 'rgb(24, 144, 255)',
    gradientFrom: 'rgba(24, 144, 255, 0.3)',
    gradientTo: 'rgba(24, 144, 255, 0)'
  },
  {
    light: 'rgba(250, 84, 28, 0.7)',
    dark: 'rgb(250, 84, 28)',
    gradientFrom: 'rgba(250, 84, 28, 0.3)',
    gradientTo: 'rgba(250, 84, 28, 0)'
  },
  {
    light: 'rgba(250, 173, 20, 0.7)',
    dark: 'rgb(250, 173, 20)',
    gradientFrom: 'rgba(250, 173, 20, 0.3)',
    gradientTo: 'rgba(250, 173, 20, 0)'
  },
  {
    light: 'rgba(82, 196, 26, 0.7)',
    dark: 'rgb(82, 196, 26)',
    gradientFrom: 'rgba(82, 196, 26, 0.3)',
    gradientTo: 'rgba(82, 196, 26, 0)'
  },
  {
    light: 'rgba(114, 46, 209, 0.7)',
    dark: 'rgb(114, 46, 209)',
    gradientFrom: 'rgba(114, 46, 209, 0.3)',
    gradientTo: 'rgba(114, 46, 209, 0)'
  },
  {
    light: 'rgba(235, 47, 150, 0.7)',
    dark: 'rgb(235, 47, 150)',
    gradientFrom: 'rgba(235, 47, 150, 0.3)',
    gradientTo: 'rgba(235, 47, 150, 0)'
  }
];

// 根据服务器ID获取颜色的函数
function getServerColor(serverId: number, index: number) {
  // 特殊服务器ID的颜色映射
  const specialColors: { [key: number]: number } = {
    102: 0,   // 蓝色
    1001: 1,  // 橙色
    1002: 2   // 黄色
  };

  // 如果是特殊服务器ID，使用指定颜色
  if (specialColors.hasOwnProperty(serverId)) {
    return serverColors[specialColors[serverId]];
  }

  // 否则根据索引循环分配颜色
  return serverColors[index % serverColors.length];
}

const { domRef, updateOptions } = useEcharts(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: 'rgba(0, 0, 0, 0.2)',
        width: 1,
        type: 'dashed'
      }
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: [10, 15],
    textStyle: {
      color: '#333'
    },
    extraCssText: 'box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);',
    formatter: function(params: any) {
      let result = `<div style="color:#666;font-size:12px;line-height:1;">${params[0].axisValue}</div>`;
      result += '<div style="height:8px"></div>';

      // 按在线人数从高到低排序
      params.sort((a: any, b: any) => b.value - a.value);

      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        // 仅显示在线人数 > 0 的服务器
        if (param.value > 0) {
          result += '<div style="display:flex;align-items:center;justify-content:space-between;margin:6px 0;">' +
                   `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${param.color};margin-right:6px;"></span>` +
                   `<span style="flex:1;text-align:left;font-size:13px;color:#333;">${param.seriesName}:</span>` +
                   `<span style="margin-left:15px;font-weight:bold;color:#333;font-size:13px;">${param.value}</span>` +
                   '</div>';
        }
      }
      return result;
    }
  },
  legend: {
    data: [],
    right: '5%',
    top: 0,
    textStyle: {
      fontSize: 12,
      color: '#666'
    },
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 20,
    selected: {
      '服务器102': true,
      '服务器1001': true,
      '服务器1002': true
    }
  },
  grid: {
    top: 50,
    left: '3%',
    right: '3%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[],
    axisLabel: {
      formatter: function(value: string) {
        // 只显示时间部分
        return value.split(' ').length > 1 ? value.split(' ')[1] : value;
      },
      fontSize: 10,
      color: '#999',
      interval: 'auto'
    },
    axisLine: {
      lineStyle: {
        color: '#eeeeee'
      }
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1, // 确保Y轴增量至少为1
    splitNumber: 5, // 控制Y轴刻度数量
    // name: '在线人数',
    nameTextStyle: {
      padding: [0, 0, 0, -30],
      fontSize: 12,
      color: '#999'
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      fontSize: 10,
      color: '#999'
    },
    splitLine: {
      lineStyle: {
        color: '#f5f5f5',
        type: 'dashed'
      }
    },
    max: undefined, // 添加max属性，初始值为undefined
    min: 0
  },
  series: []
}));

// 获取数据并渲染图表
async function fetchData() {
  // loading.value = true;
  hasError.value = false;

  try {
    // 调用实际API
    const res = await fetchGetLineChartData();

    // 根据API响应结构处理数据
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 保存完整数据
      fullData.value = res;
      processChartData();
    } else if (res && res.response && res.response.data) {
      // 处理嵌套的响应结构
      fullData.value = res.response;
      processChartData();
    } else {
      console.error('API数据格式不正确:', res);
      hasError.value = true;
    }
  } catch (error) {
    console.error('获取折线图数据失败:', error);
    hasError.value = true;
  } finally {
    // loading.value = false;
  }
}

// 处理图表数据
function processChartData() {
  const res = filteredData.value;

  // 防止数据为空
  if (!res || !res.data || !Array.isArray(res.data) || res.data.length === 0) {
    hasError.value = true;
    console.error('数据为空或格式不正确');
    return;
  }

  // 使用setTimeout确保DOM已经准备好
  setTimeout(() => {
    updateOptions(opts => {
      try {
        const firstServer = res.data[0];
        const timePoints = firstServer.trend.map((point: TrendPoint) => point.time);

        // 创建系列数据
        const newSeries = res.data.map((server: ServerData, index: number) => {
          // 对数据进行处理，减少接近重叠的数据点
          let onlineData = server.trend.map((point: TrendPoint) => point.online);

          // 如果数据点很接近（线条重叠），添加微小的偏移量
          if (index > 0) { // 只对非第一个服务器添加偏移
            onlineData = onlineData.map((value, idx) => {
              // 为每个服务器添加微小的不同偏移量，避免完全堆叠
              const offset = (index - 1) * 2 - 2; // 生成 -2, 0, 2, 4, ... 的偏移
              if (value > 0) {
                // 只对非零值添加偏移
                return value + offset;
              }
              return value;
            });
          }

          const seriesName = server.serverName;
          const colorSet = getServerColor(server.serverId, index);

          return {
            name: seriesName,
            type: 'line' as const,
            smooth: true, // 使用平滑曲线
            showSymbol: timeRange.value === '1h', // 只在1小时视图显示数据点
            symbol: 'circle',
            symbolSize: 4,
            sampling: timeRange.value === '24h' ? 'average' : undefined, // 长时间数据使用采样
            emphasis: {
              focus: 'series' as const,
              scale: false,
              lineStyle: {
                width: 3
              },
              itemStyle: {
                borderColor: colorSet.dark,
                borderWidth: 2
              }
            },
            lineStyle: {
              width: index === 0 ? 3 : 2, // 第一个服务器线条更粗
              color: colorSet.dark,
              shadowColor: 'rgba(0,0,0,0.05)',
              shadowBlur: 2,
              shadowOffsetY: 1,
              cap: 'round'
            },
            itemStyle: {
              color: colorSet.dark,
              borderWidth: 2,
              borderColor: '#fff'
            },
            areaStyle: {
              opacity: timeRange.value === '1h' ? (index === 0 ? 0.15 : 0.08) : 0.05, // 24小时视图透明度更低
              color: {
                type: 'linear' as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colorSet.gradientFrom },
                  { offset: 1, color: colorSet.gradientTo }
                ]
              }
            },
            data: onlineData,
            z: index === 0 ? 10 : (5 - index), // 控制显示层级，第一个最高
            animation: true,
            animationEasing: 'cubicOut',
            animationDuration: 1000
          };
        });

        // 对系列进行排序，确保重要的数据在上层
        newSeries.sort((a: any, b: any) => {
          const aIsImportant = a.name.includes('102');
          const bIsImportant = b.name.includes('102');
          return bIsImportant ? 1 : (aIsImportant ? -1 : 0);
        });

        // 更新图表配置
        opts.xAxis.data = timePoints;

        // 动态设置X轴标签间隔，根据时间点数量调整
        const interval = timeRange.value === '1h' ? Math.floor(timePoints.length / 6) : Math.floor(timePoints.length / 8);
        // @ts-ignore
        opts.xAxis.axisLabel.interval = interval > 0 ? interval : 0;

        opts.legend.data = res.data.map((server: ServerData) => server.serverName);

        // 计算所有数据的最大值，设置为Y轴最大值
        const allData = newSeries.flatMap((series: any) => series.data);
        const maxValue = Math.max(...allData, 10); // 至少为10
        // 将Y轴最大值设置为最大数据值的1.25倍，并取整到10的倍数
        const yMax = Math.ceil(maxValue * 1.25 / 10) * 10;
        // @ts-ignore - 忽略类型错误, ECharts配置支持max属性
        opts.yAxis.max = yMax;
        // @ts-ignore
        opts.yAxis.min = 0; // 确保最小值为0

        // 替换系列数据
        // @ts-ignore - 忽略类型错误
        opts.series = newSeries;
        return opts;
      } catch (err) {
        console.error('处理图表数据时出错:', err);
        hasError.value = true;
        return opts;
      }
    });
  }, 200);
}

// 切换时间范围
function toggleTimeRange(range: '1h' | '24h') {
  timeRange.value = range;
  processChartData();
}

// 刷新数据
async function refreshData() {
  await fetchData();
}

async function init() {
  await fetchData();
}

// 组件挂载后初始化
onMounted(() => {
  init();

  // 每分钟自动刷新数据
  const timer = setInterval(() => {
    refreshData();
  }, 60000);

  return () => {
    clearInterval(timer);
  };
});
</script>

<template>
  <div class="card-wrapper">
    <div class="chart-header">
      <div class="chart-title">{{ $t('page.home.serverOnline') }}</div>
      <div class="time-selector">
        <div class="tabs">
          <div
            class="tab-item"
            :class="{ active: timeRange === '1h' }"
            @click="toggleTimeRange('1h')"
          >
            {{ $t('common.realTime') }}
          </div>
          <div
            class="tab-item"
            :class="{ active: timeRange === '24h' }"
            @click="toggleTimeRange('24h')"
          >
            {{ $t('common.history') }}
          </div>
          <div class="refresh-icon" @click="refreshData()">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9"></path><path d="M3 12a9 9 0 0 1 9-9"></path><path d="M21 12a9 9 0 0 0-9 9"></path><path d="M3 12a9 9 0 0 0 9-9"></path></svg>
          </div>
        </div>
      </div>
    </div>
    <!-- <NSpin :show="loading"> -->
      <div ref="domRef" class="chart-container"></div>
      <!-- <template #description>
        <span v-if="hasError" class="error-text">加载失败，请重试</span>
        <span v-else>加载中...</span>
      </template>
    </NSpin> -->
  </div>
</template>

<style scoped>
.card-wrapper {
  background-color: var(--n-card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 39px;
  position: relative;
  padding-top: 10px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  /* color: #eaeaea; */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -5px;
  z-index: 1;
}

.time-selector {
  display: flex;
  align-items: center;
}

.tabs {
  display: flex;
  position: relative;
  align-items: center;
  height: 32px;
}

.tab-item {
  padding: 0 12px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  margin-right: 16px;
  transition: all 0.3s;
  border-radius: 16px;
  line-height: 26px;
}

.tab-item:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
}

.tab-item.active {
  color: #1890ff;
  font-weight: 500;
  background-color: rgba(24, 144, 255, 0.1);
}

.refresh-icon {
  cursor: pointer;
  color: #8c8c8c;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
}

.refresh-icon:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

/* .refresh-icon.loading {
  animation: spin 1s linear infinite;
  color: #1890ff;
} */

.chart-container {
  height: 320px;
  overflow: hidden;
}

.error-text {
  color: #f5222d;
}

/* @keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
} */
</style>
