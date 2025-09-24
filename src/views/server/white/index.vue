<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from "naive-ui";
import {
  fetchGetWhiteListManage,
  fetchDeleteWhiteListManage,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { serverStatusWhite } from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import WhiteOperateDrawer from "./modules/white-operate-drawer.vue";
import WhiteSelect from "./modules/white-select.vue";
import { ref, onMounted } from "vue";

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
  updateSearchParams,
} = useTable({
  apiFn: fetchGetWhiteListManage,
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
      key: "id",
      title: $t("page.manage.serverwhite.id"),
      align: "center",
      width: 64,
    },
    {
      key: "itemName",
      title: $t("page.manage.serverwhite.itemName"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "itemValue",
      title: $t("page.manage.serverwhite.itemValue"),
      align: "center",
      width: 100,
    },
    {
      key: "typeIp",
      title: $t("page.manage.serverwhite.typeIp"),
      align: "center",
      minWidth: 100,
      render: (row) => {
        if (row.typeIp === null) {
          return null;
        }

        const tagMap: Record<Api.SystemManage.whiteTypeIp, NaiveUI.ThemeColor> =
          {
            0: "primary",
            1: "error",
          };

        const label = $t(serverStatusWhite[row.typeIp]);

        return <NTag type={tagMap[row.typeIp]}>{label}</NTag>;
      },
    },
    {
      key: "updateDate",
      title: $t("page.manage.serverwhite.updateDate"),
      align: "center",
      minWidth: 200,
    },

    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 130,
      render: (row) => (
        <div class="flex-center gap-8px">
          <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row)}
          >
            {$t("common.edit")}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t("common.confirmDelete"),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t("common.delete")}
                </NButton>
              ),
            }}
          </NPopconfirm>
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
} = useTableOperate(data, getData);

async function handleBatchDelete() {
  const response = await fetchDeleteWhiteListManage({
    id: checkedRowKeys.value,
  });
  onBatchDeleted();
}

async function handleDelete(id: number) {
  await fetchDeleteWhiteListManage({ id });
  onDeleted();
}

function edit(id: number, row: any) {
  const editData = {
    ...row,
  };
  handleEdit(id, editData);
}
function handleSearch(channelId: string) {
  updateSearchParams({
    channelId,
  });
  getData();
}

onMounted(() => {
  data.value = [];
});
</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <!-- <WhiteSelect
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    /> -->
    <NCard
      :title="$t('page.manage.serverwhite.title')"
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
        />
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="(row) => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <WhiteOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>


<style scoped></style>
