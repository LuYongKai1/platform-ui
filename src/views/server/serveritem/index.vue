<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NSpace } from "naive-ui";
import {
  fetchGetServeritemList,
  fetchGetServeritemDelete,
  fetchKickServer,
  fetchGetMaintenanceSetting,
  fetchStartServer,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import {
  serverStatusVisible,
  serverStatusShow,
  serverStatusRecommend,
  serverStatusNew,
  serverRunStateRecord,
} from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import ItemOperateDrawer from "./modules/item-operate-drawer.vue";
import ItemSelect from "./modules/item-select.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { format } from 'date-fns';
import { useRouterPush } from '@/hooks/common/router';
import GroupOperateDrawer from './modules/group-operate-drawer.vue';
import { useAuth } from '@/hooks/business/auth';

const { hasAuth } = useAuth();

const appStore = useAppStore();

const groupDrawerVisible = ref(false);
const groupOperateType = ref<NaiveUI.TableOperateType>('add');
const groupRowData = ref<Api.SystemManage.servergroup | null>(null);

// 添加定时刷新计时器
const refreshTimer = ref<number | null>(null);

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
  apiFn: fetchGetServeritemList,
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
      key: "serverId",
      title: $t("page.manage.serveritem.serverId"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "serverName",
      title: $t("page.manage.serveritem.serverName"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "runState",
      title: $t("page.manage.serveritem.runState"),
      align: "center",
      minWidth: 100,
      render: (row) => {
        if (row.runState === null || row.runState === undefined) {
          return null;
        }

        const stateColors = {
          0: '#00FF00', // 绿色
          1: '#FFA500', // 黄色
          2: '#FF0000', // 红色
          3: '#86909c', // 灰色
        };

        const state = Number(row.runState);
        const color = stateColors[state] || '#86909c';
        const stateText = $t(serverRunStateRecord[state]);

        return (
          <div class="flex-center">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color
            }}></div>
            <span class="ml-2">{stateText}</span>
          </div>
        );
      }
    },
    {
      key: "onlineUser",
      title: $t("page.manage.serveritem.onlineUser"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "serverIp",
      title: $t("page.manage.serveritem.serverIp"),
      align: "center",
    },
    {
      key: "serverPort",
      title: $t("page.manage.serveritem.serverPort"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "intranetIp",
      title: $t("page.manage.serveritem.intranetIp"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "serverOpenDate",
      title: $t("page.manage.serveritem.serverOpenDate"),
      align: "center",
      minWidth: 100,
      render: (row) => {
        if (row.serverOpenDate) {
          try {
            const date = new Date(row.serverOpenDate);
            return format(date, 'yyyy-MM-dd HH:mm:ss');
          } catch (error) {
            console.error("Error formatting date:", error);
            return row.serverOpenDate;
          }
        }
        return null;
      },
    },
    {
      key: "serverTags",
      title: $t("page.manage.serveritem.serverTags"),
      align: "center",
      minWidth: 180,
      render: (row) => {
        if (row.serverNew === null || row.serverNew === undefined) {
          return null;
        }

        const serverNew = Number(row.serverNew);
        const tags = [];
        if (serverNew & 1) {
          tags.push(<NTag  type="success" >{$t("page.manage.serveritem.new")}</NTag>);
        }
        if (serverNew & 2) {
          tags.push(<NTag  type="info">{$t("page.manage.serveritem.recommend")}</NTag>);
        }
        if (serverNew & 4) {
          tags.push(<NTag  type="warning" >{$t("page.manage.serveritem.hot")}</NTag>);
        }
        if (serverNew & 8) {
          tags.push(<NTag type="error">{$t("page.manage.serveritem.noCreateRole")}</NTag>);
        }
        return tags.length > 0 ? <div class="flex-center flex-wrap gap-1">{tags}</div> : null;
      },
    },
    {
      key: "serverStatus",
      title: $t("page.manage.serveritem.serverStatus"),
      align: "center",
      minWidth: 100,
      render: (row) => {
        if (row.serverStatus === null) {
          return null;
        }
        const typeMap: Record<Api.SystemManage.serverStatus, string> = {
          0: "success",
          1: "warning",
          2: "error",
          3: "default",
          4: "info",
        };

        const label = $t(serverStatusShow[row.serverStatus]);
        return (
          <NTag  type={typeMap[row.serverStatus] || "default"}>
            {label}
          </NTag>
        );
      },
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 130,
      render: (row) => (
        <div class="flex-center gap-8px">
          {hasAuth('game:item:edit') && (
            <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row)}
          >
            {$t("common.edit")}
          </NButton>
          )}

          {hasAuth('game:item:remove') && (
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
          )}

        </div>
      ),
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

async function handleBatchDelete() {
  const response = await fetchGetServeritemDelete({
    id: checkedRowKeys.value,
  });
  onBatchDeleted();
  checkedRowKeys.value = [];
}

async function handleDelete(id: number) {
  await fetchGetServeritemDelete({ id });
  onDeleted();
}

function edit(id: number, row: any) {
  const editData = {
    ...row,
  };
  handleEdit(id, editData);
}

function handleSearch(groupId: string) {
  updateSearchParams({
    groupId,
  });
  getData();
}

async function handleKickAll() {
  const selectedIds = checkedRowKeys.value;

  interface KickResult {
    id: string | number;
    name: string;
    reason?: string;
  }

  const results: { success: KickResult[]; failed: KickResult[] } = { success: [], failed: [] };

  for (const selectedId of selectedIds) {
    const selectedRow = data.value.find(row => String(row.id) === String(selectedId));

    if (!selectedRow || !selectedRow.serverId) {
      const serverIdentifier = selectedRow?.serverName || selectedId;
      results.failed.push({ id: selectedId, name: serverIdentifier, reason: '未找到服务器信息' });
      continue;
    }

    try {
      await fetchKickServer({ serverId: selectedRow.serverId });
      results.success.push({ id: selectedId, name: selectedRow.serverName || selectedRow.serverId });
    } catch (error) {
      const serverIdentifier = selectedRow.serverName || selectedRow.serverId;
      results.failed.push({ id: selectedId, name: serverIdentifier, reason: 'API调用失败' });
    }
  }

  if (results.failed.length > 0) {
    let failedServers = results.failed.map(f => f.name).join(', ');
    if (results.success.length > 0) {
      let successServers = results.success.map(s => s.name).join(', ');
      window.$message?.warning($t('common.kickPartialSuccess', { success: successServers, failed: failedServers }));
    } else {
      window.$message?.error($t('common.kickAllFailed', { servers: failedServers }));
    }
  } else if (results.success.length > 0) {
    let successServers = results.success.map(s => s.name).join(', ');
    window.$message?.success($t('common.kickAllSuccess', { servers: successServers }));
  }

  checkedRowKeys.value = [];
  await getData();
}

// 添加维护
async function handleMaintenance() {
  const selectedIds = checkedRowKeys.value;
  if (selectedIds.length === 0) {
    window.$message?.warning($t('common.noServerSelected'));
    return;
  }

  const selectedServerIds = selectedIds.map(id => {
    const server = data.value.find(item => String(item.id) === String(id));
    return server?.serverId ? parseInt(server.serverId) : null;
  }).filter(Boolean);

  if (selectedServerIds.length === 0) {
    window.$message?.warning($t('common.noValidServerSelected'));
    return;
  }

  try {
    await fetchGetMaintenanceSetting(selectedServerIds);
    const serverNames = selectedIds.map(id => {
      const server = data.value.find(item => String(item.id) === String(id));
      return server?.serverName || server?.serverId || id;
    }).join(', ');
    window.$message?.success($t('common.maintenanceSuccess', { servers: serverNames }));
    checkedRowKeys.value = [];
    await getData(); // 刷新数据列表
  } catch (error) {
    console.error("设置维护模式失败:", error);
    window.$message?.error($t('common.maintenanceFailed'));
  }
}

function handleQueue() {
  const selectedIds = checkedRowKeys.value;
  if (selectedIds.length === 0) {
    window.$message?.warning($t('common.noServerSelected'));
    return;
  }

  // 获取选中服务器的serverId
  const selectedServerIds = selectedIds.map(id => {
    const server = data.value.find(item => String(item.id) === String(id));
    return server?.serverId;
  }).filter(Boolean);

  if (selectedServerIds.length === 0) {

    window.$message?.warning($t('common.noValidServerSelected'));
    return;
  }

  groupOperateType.value = 'add';
  groupRowData.value = {
    gameId: "101",
    setto: "",
    serverList: selectedServerIds.join(',')
  };
  groupDrawerVisible.value = true;
}

async function handleStartServer() {
  const selectedIds = checkedRowKeys.value;
  if (selectedIds.length === 0) {
    window.$message?.warning($t('common.noServerSelected'));
    return;
  }

  const selectedServerIds = selectedIds.map(id => {
    const server = data.value.find(item => String(item.id) === String(id));
    return server?.serverId ? parseInt(server.serverId) : null;
  }).filter(Boolean);

  if (selectedServerIds.length === 0) {
    window.$message?.warning($t('common.noValidServerSelected'));
    return;
  }

  try {
    await fetchStartServer(selectedServerIds);
    const serverNames = selectedIds.map(id => {
      const server = data.value.find(item => String(item.id) === String(id));
      return server?.serverName || server?.serverId || id;
    }).join(', ');
    window.$message?.success($t('common.startServerAllSuccess'));
    checkedRowKeys.value = [];
    await getData();
  } catch (error) {
    console.error("开启服务器失败:", error);
    window.$message?.error($t('common.startServerAllFailed'));
  }
}

onMounted(() => {
  data.value = [];

  refreshTimer.value = window.setInterval(async () => {
    try {
      const response = await fetchGetServeritemList({
        ...searchParams.value,
        current: mobilePagination.value.page,
        size: mobilePagination.value.pageSize
      });

      if (response.data) {
        data.value = response.data.records || [];
      }
    } catch (error) {
      console.error('自动刷新数据失败:', error);
    }
  }, 3000);
});



// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});
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
      :title="$t('page.manage.serveritem.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <NSpace>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
            @kick-all="handleKickAll"
            @maintenance="handleMaintenance"
            @queue="handleQueue"
            @start-server="handleStartServer"
            :show-add="hasAuth('game:item:add')"
            :show-batch-delete="hasAuth('game:item:edit')"
            :show-start-server="hasAuth('game:item:normalstate')"
            :show-maintenance="hasAuth('game:item:maintenance')"
            :show-queue="hasAuth('game:item:queue')"
            :show-kick-all="hasAuth('game:item:kickAll')"
          />
        </NSpace>
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

      <ItemOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />

      <GroupOperateDrawer
        v-model:visible="groupDrawerVisible"
        :operate-type="groupOperateType"
        :row-data="groupRowData"
        @submitted="getData"
        @clearSelection="checkedRowKeys = []"
      />
    </NCard>
  </div>
</template>


<style scoped></style>
