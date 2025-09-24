<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { $t } from '@/locales';
import { fetchGetHomeData,fetchGetTodayPay } from '@/service/api/system-manage';

defineOptions({
  name: 'CardData'
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

// 今日付费数据接口
interface TodayPayResponse {
  totalAmount: number;
  totalCount: number;
}

// API响应结构
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


interface TodayPayApiResponse {
  error: any;
  response?: {
    data: TodayPayResponse;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    request: any;
  };
  data?: TodayPayResponse;
}

const homeData = ref<HomeDataResponse>({
  totalAmount: 0,
  onlineUser: 0,
  userRecord: 0,
  userRole: 0,
  levelDistribution: []
});

// 今日付费数据
const todayPayData = ref<TodayPayResponse>({
  totalAmount: 0,
  totalCount: 0
});

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'visitCount',
    title: $t('page.home.visitCount'),
    value: homeData.value.onlineUser,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'ant-design:bar-chart-outlined'
  },
  {
    key: 'downloadCount',
    title: $t('page.home.downloadCount'),
    value: homeData.value.userRecord,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'carbon:document-download'
  },
  {
    key: 'dealCount',
    title: $t('page.home.dealCount'),
    value: homeData.value.userRole,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'ant-design:trademark-circle-outlined'
  },
  {
    key: 'turnover',
    title: $t('page.home.turnover'),
    value: todayPayData.value.totalAmount,
    unit: '$',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'ant-design:money-collect-outlined'
  },
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}

async function fetchHomeData() {
  try {
    try {
      const result = await fetchGetHomeData() as unknown as ApiResponse;

      if (result && result.response && result.response.data) {
        homeData.value = result.response.data;
      } else if (result && result.data) {
        homeData.value = result.data;
      }
    } catch (error) {

    }
  } catch (error) {
    console.error('获取首页数据失败:', error);
  }
}

// 获取今日付费数据
async function fetchTodayPayData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await fetchGetTodayPay({
      serverId: '',
      channelId: '',
      dataType: 'DAY',
      endDay: today
    }) as unknown as TodayPayApiResponse;


    if (result && result.response && result.response.data.totalAmount) {
      todayPayData.value = result.response.data;
    } else if (result && result.data) {
      todayPayData.value = result.data;
    }
  } catch (error) {
    console.error('获取今日付费数据失败:', error);
  }
}

onMounted(() => {
  fetchHomeData();
  fetchTodayPayData();
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="rd-8px px-16px pb-4px pt-8px text-white" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->

    <NGrid cols="s:1 m:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi v-for="item in cardData" :key="item.key">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
          <div class="flex justify-between">
            <h3 class="text-16px">{{ item.title }}</h3>
            <span v-if="item.subTitle" class="text-14px opacity-80">{{ item.subTitle }}</span>
          </div>
          <div class="flex justify-between pt-12px">
            <SvgIcon :icon="item.icon" class="text-32px" />
            <CountTo
              :prefix="item.unit"
              :start-value="1"
              :end-value="item.value"
              class="text-30px text-white dark:text-dark"
            />
          </div>
        </GradientBg>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
