<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import HeaderBanner from './modules/header-banner.vue';
import CardData from './modules/card-data.vue';
import LineChart from './modules/line-chart.vue';
import PieChart from './modules/pie-chart.vue';
import ProjectNews from './modules/project-news.vue';
import CreativityBanner from './modules/creativity-banner.vue';
import LevelDistributionChart from './modules/creativity-banner.vue';
import Levelstatschart from './modules/Levelstatschart.vue';
import Levelstatschartcc from './modules/levelstatschartcc.vue';

const appStore = useAppStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));
</script>

<template>
  <NSpace vertical :size="16">
    <!-- <HeaderBanner /> -->
    <CardData />
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14">
        <NCard :bordered="false" class="card-wrapper">
          <LineChart />
        </NCard>
      </NGi>
      <NGi span="24 s:24 m:10">
        <NCard :bordered="false" class="card-wrapper">
          <PieChart />
        </NCard>
      </NGi>
    </NGrid>

    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24">
        <NCard :bordered="false" class="card-wrapper">
          <ProjectNews />
        </NCard>
      </NGi>
      <!-- <NGi span="24 s:24 m:10">
        <LevelDistributionChart />
      </NGi> -->
      <NGi span="24">
        <NCard :bordered="false" class="card-wrapper">
          <Levelstatschart />
        </NCard>
      </NGi>
      <NGi span="24">
        <NCard :bordered="false" class="card-wrapper">
          <Levelstatschartcc />
        </NCard>
      </NGi>
    </NGrid>

  </NSpace>
</template>

<style scoped>
.card-wrapper {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}
.card-wrapper:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
</style>
