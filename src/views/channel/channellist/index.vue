<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from "naive-ui";
import { fetchGetChannel,fetchDeleteChannelList } from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { channelenableRecord, userGenderRecord } from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import UserOperateDrawer from './modules/channel-operate-drawer.vue';
import GameSearch from './modules/channel-search.vue';
import { useAuth } from '@/hooks/business/auth';

const { hasAuth } = useAuth();

const appStore = useAppStore();

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams,
} = useTable({
  apiFn: fetchGetChannel,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
  },
  columns: () => [
    {
      type: "selection",
      align: "center",
      width: 48,
    },
    {
      key: "channelId",
      title: $t("page.manage.channel.channelId"),
      align: "center",
      width: 64,
    },
    {
      key: "channelName",
      title: $t("page.manage.channel.channelName"),
      align: "center",
      minWidth: 130,
    },
    {
      key: "channelBriefName",
      title: $t("page.manage.channel.channelBriefName"),
      align: "center",
      minWidth: 180,
      ellipsis: { tooltip: true },
    },
    {
      key: "channelUserTotal",
      title: $t("page.manage.channel.channelUserTotal"),
      align: "center",
      minWidth: 130,
    },

    {
      key: "createDate",
      title: $t("page.manage.channel.createDate"),
      align: "center",
      minWidth: 130,
    },
    {
      key: "updateDate",
      title: $t("page.manage.channel.updateDate"),
      align: "center",
      minWidth: 130,
    },
    {
      key: "enable",
      title: $t("page.manage.channel.enable"),
      align: "center",
      minWidth: 100,
      render: (row) => {
        if (row.enable === null) {
          return null;
        }

        const tagMap: Record<Api.SystemManage.Channelenable, NaiveUI.ThemeColor> = {
          0: "success",
          1: "error",
        };

        const label = $t(channelenableRecord[row.enable]);

        return <NTag type={tagMap[row.enable]}>{label}</NTag>;
      },
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 130,
      render: (row) => (
        <div class="flex-center gap-8px">

          {hasAuth('game:channel:edit') && (
            <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row)}
          >
            {$t("common.edit")}
          </NButton>
          )}
          {hasAuth('game:channel:remove') && (
            <NButton
              type="error"
              ghost
              size="small"
              onClick={() => handleDelete(row.channelId)}
            >
              {$t("common.delete")}
            </NButton>
          )}
        </div>
      ),
    },
  ],
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted,
  // closeDrawer
} = useTableOperate(data, getData);

async function handleBatchDelete() {
  const response = await fetchDeleteChannelList({ channelId: checkedRowKeys.value });
  onBatchDeleted();
}

async function handleDelete(channelId : number) {

  await fetchDeleteChannelList({ channelId });
  onDeleted();
}

function edit(id: number, row: Api.channel["game"]) {
  const editData = {
    ...row,
  };

  handleEdit(id, editData);
}
</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <GameSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />
    <NCard
      :title="$t('page.manage.channel.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
          :show-add="hasAuth('game:channel:add')"
          :show-batch-delete="hasAuth('game:channel:remove')"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1200"
        :loading="loading"
        remote
        :row-key="(row) => row.channelId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
