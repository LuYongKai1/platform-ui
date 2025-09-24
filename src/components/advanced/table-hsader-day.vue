<script setup lang="ts">
import { $t } from '@/locales';
import { ref } from 'vue';

defineOptions({
  name: 'TableHeaderday'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'refresh'): void;
  (e: 'filterTime', range: 'day' | 'week' | 'month'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

const activeTimeRange = ref<'day' | 'week' | 'month'>('day');

function filterTime(range: 'day' | 'week' | 'month') {
  activeTimeRange.value = range;
  emit('filterTime', range);
}

function refresh() {
  emit('refresh');
}

</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <NButtonGroup size="small">
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'day' ? 'primary' : 'default'"
        ghost
        @click="filterTime('day')"
      >日</NButton>
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'week' ? 'primary' : 'default'"
        ghost
        @click="filterTime('week')"
      >周</NButton>
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'month' ? 'primary' : 'default'"
        ghost
        @click="filterTime('month')"
      >月</NButton>
    </NButtonGroup>
    <NButton size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </NButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
