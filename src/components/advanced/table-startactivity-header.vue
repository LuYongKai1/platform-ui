<script setup lang="ts">
import { $t } from '@/locales';
import { ref } from 'vue';

defineOptions({
  name: 'StartActivityHeader',
});

interface Props {
  itemAlign?: NaiveUI.Align;
  loading?: boolean;
  serverName?: string;
  gameTitle?: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'viewServer'): void;
  (e: 'pushToGame'): void;
  (e: 'endActivity'): void;
  (e: 'refresh'): void;
  (e: 'viewLogs'): void;
  (e: 'serverChange', server: string): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

const selectedServer = ref(props.serverName || 'CH001-群雄争霸');

function handleServerChange(value: string) {
  selectedServer.value = value;
  emit('serverChange', value);
}

function viewServer() {
  emit('viewServer');
}

function pushToGame() {
  emit('pushToGame');
}

function endActivity() {
  emit('endActivity');
}

function refresh() {
  emit('refresh');
}

function viewLogs() {
  emit('viewLogs');
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="space-between" class="w-full">
    <NSpace>
      <NButton size="small" type="primary" @click="viewServer" class="server-btn">
        <template #icon>
          <icon-mdi-server class="text-icon mr-1" />
        </template>
        {{ $t("common.currentViewServer") }}
      </NButton>

      <NSelect
        size="small"
        v-model:value="selectedServer"
        @update:value="handleServerChange"
        :options="[
          {label: 'CH001-群雄争霸', value: 'CH001-群雄争霸'},
          {label: 'CH002-逐鹿中原', value: 'CH002-逐鹿中原'},
          {label: 'CH003-风云天下', value: 'CH003-风云天下'},
          {label: 'CH004-锋芒毕露', value: 'CH004-锋芒毕露'},
          {label: 'CH005-傲视群雄', value: 'CH005-傲视群雄'},
          {label: 'CH006-称霸天下', value: 'CH006-称霸天下'},
          {label: 'CH009-外网测试', value: 'CH009-外网测试'}
        ]"
        class="min-w-180px server-select"
      />
    </NSpace>

    <NSpace>
      <slot name="prefix"></slot>
      <slot name="default">
        <NButton size="small" type="success" @click="pushToGame" class="action-btn">
          <template #icon>
            <icon-mdi-publish class="text-icon mr-1" />
          </template>
          {{ $t("common.pushToGame") }}
        </NButton>

        <NButton size="small" type="error" @click="endActivity" class="action-btn">
          <template #icon>
            <icon-mdi-stop-circle class="text-icon mr-1" />
          </template>
          {{ $t("common.endActivity") }}
        </NButton>

        <NButton size="small" type="info" @click="viewLogs" class="action-btn">
          <template #icon>
            <icon-mdi-history class="text-icon mr-1" />
          </template>
          {{ $t("common.operationLogs") }}
        </NButton>
      </slot>

      <NButton size="small" @click="refresh" class="refresh-btn">
        <template #icon>
          <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
        </template>
        {{ $t('common.refresh') }}
      </NButton>

      <TableColumnSetting v-model:columns="columns" />
      <slot name="suffix"></slot>
    </NSpace>
  </NSpace>
</template>

<style scoped>
.server-btn {
  font-weight: 500;
  border-radius: 4px;
}

.server-select {
  border-radius: 4px;
}

.action-btn {
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.refresh-btn {
  border-radius: 4px;
}
</style>
