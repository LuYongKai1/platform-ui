<script setup lang="ts">
import { NModal, NDataTable, NTag, NCard } from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import { computed, h } from "vue";
import { $t } from "@/locales";

defineOptions({
  name: "ViewStatusModal",
});

interface ServerData {
  roleId: string;
  roleName?: string;
  serverId: string;
  serverName?: string;
  success?: boolean;
  ok?: boolean;
  message?: string;
  msg?: string;
}

interface Props {
  serverData: ServerData[] | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>("visible", {
  default: false,
});

const columns = computed<DataTableColumns<ServerData>>(() => [
  {
    title: $t("page.manage.operateserver.roleName"),
    key: "roleName",
    align: "center",
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => {
      return row.roleName || row.roleId || "-";
    }
  },
  {
    title: $t("page.manage.operateserver.roleId"),
    key: "roleId",
    align: "center",
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: $t("page.manage.operateserver.serverName"),
    key: "serverName",
    align: "center",
    width: 120,
    render: (row) => {
      return row.serverName || row.serverId || "-";
    }
  },
  {
    title: $t("page.manage.operateserver.Sending"),
    key: "success",
    align: "center",
    width: 150,
    render: (row) => {
      const statusField = row.success !== undefined ? row.success : row.ok;

      if (statusField === undefined) {
        return h(
          NTag,
          {
            type: "info",
            style: "min-width: 80px; text-align: center; display: flex; justify-content: center;",
          },
          { default: () => "未发送" }
        );
      }

      return h(
        NTag,
        {
          type: statusField ? "success" : "error",
          style: "min-width: 80px; text-align: center; display: flex; justify-content: center;",
        },
        { default: () => (statusField ? "发送成功" : "发送失败") }
      );
    },
  },
  {
    title: $t("page.manage.operateserver.msg"),
    key: "message",
    align: "left",
    render: (row) => {
      return row.message || row.msg || "-";
    }
  }
]);

function closeModal() {
  visible.value = false;
}
</script>

<template>
  <div
  class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <NModal
      v-model:show="visible"
      preset="dialog"
      :title="$t('page.manage.operateserver.titleserver')"
      style="width: 1300px; height: 600px;"
      :mask-closable="true"
      :close-on-esc="true"
    >
      <NCard size="small" :bordered="false">
        <NDataTable
          :columns="columns"
          :data="props.serverData || []"
          :bordered="true"
          size="small"
        />
      </NCard>
    </NModal>
  </div>
</template>

<style scoped></style>


