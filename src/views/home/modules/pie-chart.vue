<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetHomeData } from '@/service/api/system-manage';

defineOptions({
  name: 'PieChart'
});

interface HomeDataResponse {
  totalAmount: number;
  onlineUser: number;
  userRecord: number;
  userRole: number;
  levelDistribution: {
    range: string;
    count: number;
  }[];
}

interface ApiResponse {
  error: any;
  response?: {
    data: HomeDataResponse;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    request: any;
  };
  data?: HomeDataResponse;
}

const levelData = ref<{range: string; count: number}[]>([]);
const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '1%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#5da8ff', '#8e9dff', '#fedc69', '#26deca'],
      name: $t('page.home.schedule'),
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: [] as { name: string; value: number }[]
    }
  ]
}));

async function fetchAndUpdateData() {
  try {
    const result = await fetchGetHomeData() as unknown as ApiResponse;
    if (result && result.response && result.response.data && result.response.data.levelDistribution) {
      levelData.value = result.response.data.levelDistribution;
    } else if (result && result.data && result.data.levelDistribution) {
      levelData.value = result.data.levelDistribution;
    }

    updateLevelDistribution();
  } catch (error) {
    updateLevelDistribution();
  }
}

function updateLevelDistribution() {
  updateOptions(opts => {
    opts.series[0].data = levelData.value.map(item => ({
      name: item.range,
      value: item.count
    }));
    return opts;
  });
}

function updateLocale() {
  updateOptions((opts, factory) => {
    opts.series[0].name = '等级分布';

    if (levelData.value && levelData.value.length > 0) {
      opts.series[0].data = levelData.value.map(item => ({
        name: item.range,
        value: item.count
      }));
    }
    return opts;
  });
}

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

onMounted(() => {
  fetchAndUpdateData();
});
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <div class="text-center text-16px font-bold mb-2">{{ $t('page.home.level') }}</div>
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </NCard>
</template>
<style scoped></style>
