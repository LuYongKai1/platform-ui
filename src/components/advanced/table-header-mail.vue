<!-- <script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderMail'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;
  disabledCancel?: boolean;
  showAdd?: boolean;
  showBatchDelete?: boolean;
  showCancel?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'add'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">

      <NButton v-if="showAdd" size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </NButton>

      <NPopconfirm v-if="showBatchDelete" @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDeleteMail') }}
      </NPopconfirm>

      <NPopconfirm v-if="showCancel" @positive-click="cancel">
        <template #trigger>
          <NButton size="small" ghost type="warning" :disabled="disabledCancel">
            <template #icon>
              <icon-mdi-cancel class="text-icon" />
            </template>
            {{ $t('common.cancelMail') }}
          </NButton>
        </template>
        {{ $t('common.confirmCancel') }}
      </NPopconfirm>
    </slot>
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

<style scoped></style> -->
