<script setup lang="ts">
import { $t } from "@/locales";
import { ref } from "vue";

defineOptions({
  name: "TableHeaderOperation",
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;
  showAdd?: boolean;
  showBatchDelete?: boolean;
  showImport?: boolean;
  showExport?: boolean;
  showExportConfirm?: boolean;
  showTimeFilter?: boolean;
  disabledCancel?: boolean;
  showCancel?: boolean;
  showStartServer?: boolean;
  showMaintenance?: boolean;
  showQueue?: boolean;
  showKickAll?: boolean;
  showsynv?: boolean;
  showUpload?: boolean;
  showBatchRecharge?: boolean;
  showBatchCancel?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: "add"): void;
  (e: "delete"): void;
  (e: "refresh"): void;
  (e: "import"): void;
  (e: "export"): void;
  (e: "filterTime", range: "day" | "week" | "month"): void;
  (e: "cancel"): void;
  (e: "maintenance"): void; // 维护
  (e: "queue"): void; // 队列
  (e: "start-server"): void; // 启动服务器
  (e: "kick-all"): void; // 踢出所有
  (e: "sync"): void; // 同步
  (e: "upload"): void; // 上传
  (e: "batchRecharge"): void; // 批量补单
  (e: "batchCancel"): void; // 批量作废
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>("columns", {
  default: () => [],
});

const activeTimeRange = ref<"day" | "week" | "month">("day");

function add() {
  emit("add");
}

function filterTime(range: "day" | "week" | "month") {
  activeTimeRange.value = range;
  emit("filterTime", range);
}

function batchDelete() {
  emit("delete");
}

function refresh() {
  emit("refresh");
}

function importData() {
  emit("import");
}

function exportData() {
  emit("export");
}

function cancel() {
  emit("cancel");
}

function maintenance() {
  emit("maintenance");
}

function queue() {
  emit("queue");
}

function startServer() {
  emit("start-server");
}

function kickAll() {
  emit("kick-all");
}

function sync() {
  emit("sync");
}

function upload() {
  emit("upload");
}

function batchRecharge() {
  emit("batchRecharge");
}

function batchCancel() {
  emit("batchCancel");
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>

    <NButtonGroup v-if="showTimeFilter" size="small">
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'day' ? 'primary' : 'default'"
        ghost
        @click="filterTime('day')"
        >{{ $t("common.day") }}</NButton
      >
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'week' ? 'primary' : 'default'"
        ghost
        @click="filterTime('week')"
        >{{ $t("common.week") }}</NButton
      >
      <NButton
        :focusable="false"
        :type="activeTimeRange === 'month' ? 'primary' : 'default'"
        ghost
        @click="filterTime('month')"
        >{{ $t("common.month") }}</NButton
      >
    </NButtonGroup>

    <slot name="default">
      <NButton v-if="showAdd" size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t("common.add") }}
      </NButton>

      <NButton
        v-if="showImport"
        size="small"
        ghost
        type="primary"
        @click="importData"
      >
        <template #icon>
          <icon-mdi-upload class="text-icon" />
        </template>
        {{ $t("common.import") }}
      </NButton>

      <NButton
        v-if="showUpload"
        size="small"
        ghost
        type="primary"
        @click="upload"
      >
        <template #icon>
          <icon-mdi-upload class="text-icon" />
        </template>
        {{ $t("common.upload") }}
      </NButton>

      <NButton
        v-if="showBatchRecharge"
        size="small"
        ghost
        type="primary"
        @click="batchRecharge"
      >
        {{ $t("common.batchRecharge") }}
        <template #icon>
          <icon-mdi-sync class="text-icon" />
        </template>
      </NButton>

      <NPopconfirm
        v-if="showExport && showExportConfirm"
        @positive-click="exportData"
      >
        <template #trigger>
          <NButton size="small" ghost type="success">
            <template #icon>
              <icon-mdi-download class="text-icon" />
            </template>
            {{ $t("common.export") }}
          </NButton>
        </template>
        {{ $t("common.confirmExport") }}
      </NPopconfirm>

      <NButton
        v-if="showExport && !showExportConfirm"
        size="small"
        ghost
        type="success"
        @click="exportData"
      >
        <template #icon>
          <icon-mdi-download class="text-icon" />
        </template>
        {{ $t("common.export") }}
      </NButton>

      <NButton v-if="showsynv" size="small" ghost type="success" @click="sync">
        <template #icon>
          <icon-mdi-sync class="text-icon" />
        </template>
        {{ $t("common.sync") }}
      </NButton>

      <NPopconfirm v-if="showBatchDelete" @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t("common.batchDelete") }}
          </NButton>
        </template>
        {{ $t("common.confirmDelete") }}
      </NPopconfirm>

      <NPopconfirm v-if="showBatchCancel" @positive-click="batchCancel">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t("common.batchCancel") }}
          </NButton>
        </template>
        {{ $t("common.confirmBatchCancel") }}
      </NPopconfirm>

      <NPopconfirm v-if="showCancel" @positive-click="cancel">
        <template #trigger>
          <NButton size="small" ghost type="warning" :disabled="disabledCancel">
            <template #icon>
              <icon-mdi-cancel class="text-icon" />
            </template>
            {{ $t("common.cancelMail") }}
          </NButton>
        </template>
        {{ $t("common.confirmCancel") }}
      </NPopconfirm>

      <!-- 开启服务器按钮 -->
      <NPopconfirm v-if="showStartServer" @positive-click="startServer">
        <template #trigger>
          <NButton size="small" ghost type="success" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-server class="text-icon" />
            </template>
            {{ $t("common.startServer") }}
          </NButton>
        </template>
        {{ $t("common.confirmStartServer") }}
      </NPopconfirm>

      <!-- 维护按钮 -->
      <NPopconfirm v-if="showMaintenance" @positive-click="maintenance">
        <template #trigger>
          <NButton size="small" ghost type="warning" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-tools class="text-icon" />
            </template>
            {{ $t("common.maintenance") }}
          </NButton>
        </template>
        {{ $t("common.confirmMaintenance") }}
      </NPopconfirm>

      <!-- 排队按钮 - 直接点击触发 -->
      <NButton
        v-if="showQueue"
        size="small"
        ghost
        type="info"
        :disabled="disabledDelete"
        @click="queue"
      >
        <template #icon>
          <icon-mdi-account-multiple class="text-icon" />
        </template>
        {{ $t("common.queue") }}
      </NButton>

      <!-- 踢出所有按钮 -->
      <NPopconfirm v-if="showKickAll" @positive-click="kickAll">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-mdi-logout class="text-icon" />
            </template>
            {{ $t("common.kickAll") }}
          </NButton>
        </template>
        {{ $t("common.confirmKickAll") }}
      </NPopconfirm>
    </slot>
    <NButton size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh
          class="text-icon"
          :class="{ 'animate-spin': loading }"
        />
      </template>
      {{ $t("common.refresh") }}
    </NButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
