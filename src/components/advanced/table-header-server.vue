<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderServer'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;
  showAdd?: boolean;
  showBatchDelete?: boolean;
  showStartServer?: boolean;
  showMaintenance?: boolean;
  showQueue?: boolean;
  showKickAll?: boolean;
}

defineProps<Props>();
interface Emits {
  (e: 'add'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
  (e: 'kick-all'): void;
  (e: 'maintenance'): void;
  (e: 'queue'): void;
  (e: 'start-server'): void;
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

function kickAll() {
  emit('kick-all');
}

function maintenance() {
  emit('maintenance');
}

function queue() {
  emit('queue');
}

function startServer() {
  emit('start-server');
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
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>

      <!-- 开启服务器按钮 -->
      <NPopconfirm v-if="showStartServer" @positive-click="startServer">
        <template #trigger>
          <NButton size="small" ghost type="success" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-server class="text-icon" />
            </template>
            {{ $t('common.startServer') }}
          </NButton>
        </template>
        {{ $t('common.confirmStartServer') }}
      </NPopconfirm>

        <!-- 维护按钮 -->
        <NPopconfirm v-if="showMaintenance" @positive-click="maintenance">
        <template #trigger>
          <NButton size="small" ghost type="warning" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-tools class="text-icon" />
            </template>
            {{ $t('common.maintenance') }}
          </NButton>
        </template>
        {{ $t('common.confirmMaintenance') }}
      </NPopconfirm>

      <!-- 排队按钮 - 直接点击触发 -->
      <NButton v-if="showQueue" size="small" ghost type="info" :disabled="disabledDelete" @click="queue">
        <template #icon>
          <icon-mdi-account-multiple class="text-icon" />
        </template>
        {{ $t('common.queue') }}
      </NButton>


      <!-- 踢出所有按钮 -->
      <NPopconfirm v-if="showKickAll" @positive-click="kickAll">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-logout class="text-icon" />
            </template>
            {{ $t('common.kickAll') }}
          </NButton>
        </template>
        {{ $t('common.confirmKickAll') }}
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

<style scoped></style>
