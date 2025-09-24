<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NSpace, NCard } from "naive-ui";
import {
  fetchGetGuildList,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import {
  serverStatusVisible,
} from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import ItemSelect from "./modules/item-select.vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { format } from 'date-fns';
import { useRouterPush } from '@/hooks/common/router';
import { useAuth } from '@/hooks/business/auth';
import type { Api } from '@/typings/api';

const { hasAuth } = useAuth();

const appStore = useAppStore();

const groupDrawerVisible = ref(false);
const groupOperateType = ref<NaiveUI.TableOperateType>('add');
const groupRowData = ref<any>(null);

// 自定义搜索参数类型，继承 CommonSearchParams 并扩展 serverId
interface GuildSearchParams extends Api.Common.CommonSearchParams {
  serverId?: string;
}

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
} = useTable<any>({
  apiFn: fetchGetGuildList,
  apiParams: {
    current: 1,
    size: 10,
  } as GuildSearchParams,
  columns: () => [
    // {
    //   type: "selection",
    //   align: "center",
    //   width: 48,
    // },
    {
      key: "guid",
      title: $t("page.manage.guildslist.guildId"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "guild_name",
      title: $t("page.manage.guildslist.guildName"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "leader_cuid",
      title: $t("page.manage.guildslist.leadercuid"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "leader_name",
      title: $t("page.manage.guildslist.leaderName"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "member_count",
      title: $t("page.manage.guildslist.memberCount"),
      align: "center",
    },
    {
      key: "gulid_level",
      title: $t("page.manage.guildslist.guildLevel"),
      align: "center",
      minWidth: 100,
    },

  ],
});

const defaultHiddenKeys = ['serverIp', 'serverPort', 'intranetIp'];
columnChecks.value.forEach((columnCheck) => {
  if (defaultHiddenKeys.includes(columnCheck.key as string)) {
    columnCheck.checked = false;
  }
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


function handleSearch(serverId: string) {
  updateSearchParams({
    serverId,
  });
  getData();
}


</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <ItemSelect
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    />

    <NCard
      :title="$t('page.manage.guildslist.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
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
    </NCard>
  </div>
</template>


<style scoped></style>
