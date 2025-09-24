<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NSpace } from "naive-ui";
import {
  fetchGetServerCrossList,
  fetchSyncServerCross,
  fetchGetServeritemDelete,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { serverStatusShow } from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import { ref, onMounted, computed } from "vue";
import { format } from 'date-fns';
import CrossOperateDrawer from "./modules/cross-operate-drawer.vue";
import ConfigOperateDrawer from './modules/config-operate-drawer.vue';
import { useAuth } from '@/hooks/business/auth';
import { handleApiResponseError, handleApiCatchError } from '@/utils/common';

const { hasAuth } = useAuth();
const appStore = useAppStore();

const groupDrawerVisible = ref(false);
const groupRowData = ref<any>(null);

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  searchParams,
  resetSearchParams,
  updateSearchParams,
} = useTable({
  apiFn: fetchGetServerCrossList as any,
  showTotal: true,
  immediate: false,
  apiParams: {
    current: 1,
    size: 10,
  },
  columns: () => [
    {
      type: "selection",
      align: "center",
      width: 48,
      disabled: (row: any) => row.nodeType === 'normal'
    },
    {
      key: "serverId",
      title: $t("page.manage.serveritem.serverId"),
      align: "center",
      minWidth: 100,
      render: (row: any) => row.serverId || row.id
    },
    {
      key: "serverName",
      title: $t("page.manage.serveritem.serverName"),
      align: "center",
      minWidth: 100,
      render: (row: any) => {
        const isCross = row.nodeType === 'cross';
        const isNormal = row.nodeType === 'normal';
        return (
          <div class="flex-center">
            {isCross && (
              <NTag type="info" size="small" class="mr-2">{$t("page.manage.servercross.cross")}</NTag>
            )}
            {isNormal && (
              <NTag type="default" size="small" class="mr-2">{$t("page.manage.servercross.normal")}</NTag>
            )}
            <span>{row.serverName}</span>
          </div>
        );
      }
    },
    {
      key: "serverOpenDate",
      title: $t("page.manage.serveritem.serverOpenDate"),
      align: "center",
      minWidth: 100,
      render: (row: any) => {
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
      key: "serverStatus",
      title: $t("page.manage.serveritem.serverStatus"),
      align: "center",
      minWidth: 100,
      render: (row: any) => {
        if (row.serverStatus === null) return null;

        const typeMap: Record<number, "success" | "warning" | "error" | "default" | "info"> = {
          0: "success",
          1: "warning",
          2: "error",
          3: "default",
          4: "info",
          5: "default",
        };

        const label = $t(serverStatusShow[row.serverStatus as keyof typeof serverStatusShow]);
        return (
          <NTag type={typeMap[row.serverStatus] || "default"}>
            {label}
          </NTag>
        );
      },
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 200,
      render: (row: any) => (
        <div class="flex-center gap-8px">
          {row.nodeType === 'cross' && hasAuth('game:crossRelation:add') && (
            <NButton
              type="info"
              ghost
              size="small"
              onClick={() => handleAssign(row)}
            >
              {$t("page.manage.servercross.assign")}
            </NButton>
          )}

          {row.nodeType === 'cross' && hasAuth('game:item:edit') && (
            <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row)}
          >
            {$t("common.edit")}
          </NButton>
          )}

          {row.nodeType === 'cross' && hasAuth('game:item:remove') && (
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
  ] as any,
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
} = useTableOperate(data as any, getData);

// 处理子服务器数据的函数
function processChildServers(children: any[] = [], parentId: string | number) {
  return children.map((child: any) => ({
    ...child,
    nodeType: 'normal',
    id: `${parentId}_${child.normalServerId || child.id}`,
    serverId: child.normalServerId || child.id,
    serverName: child.serverName || `服务器${child.normalServerId}`,
    serverOpenDate: child.startTime || null,
    serverStatus: child.status || 0
  }));
}

const treeData = computed(() => {
  return (data.value as any[]).map(server => {
    const children = processChildServers(server.children || [], server.id);
    return {
      ...server,
      nodeType: 'cross',
      id: server.id,
      children: children
    };
  });
});

onMounted(async () => {
  await getData();
});

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

function handleAssign(row: any) {
  groupRowData.value = row;
  groupDrawerVisible.value = true;
}

async function handleGroupSubmitted() {
  await getData();
}

// 处理同步功能
function buildSyncParams(crossServer: any) {
  const serverIds = (crossServer.children || [])
    .map((child: any) => Number(child.normalServerId || child.serverId || child.id))
    .filter((id: number) => !isNaN(id));

  const crossServerId = Number(crossServer.serverId || crossServer.id);

  return {
    gameId: 101, // 默认游戏ID
    crossServerId,
    serverIds
  };
}

async function handleSync() {
  if (checkedRowKeys.value.length === 0) {
    window.$message?.warning($t("page.manage.servercross.form.crossServer"));
    return;
  }

  try {
    // 用 Map 保证唯一性 (key: crossServerId)
    const crossServerMap = new Map<number, any>();

    for (const id of checkedRowKeys.value) {
      for (const cross of treeData.value) {
        if (cross.id === id && cross.nodeType === "cross") {
          crossServerMap.set(Number(cross.serverId || cross.id), cross);
        } else if (cross.children?.some((c: any) => c.id === id && c.nodeType === "normal")) {
          crossServerMap.set(Number(cross.serverId || cross.id), cross);
        }
      }
    }

    // 执行同步
    for (const crossServer of crossServerMap.values()) {
      const syncParams = buildSyncParams(crossServer);
      const response = await fetchSyncServerCross(syncParams);

      // 根据响应结构判断同步结果
      if (response.error) {
        // 检查是否有实际的响应数据
        const responseData = response.response?.data;
        if (responseData) {
          const { code, msg } = responseData;
          if (code === 0) {
            window.$message?.success(
              `${crossServer.serverName} ${$t("common.syncSuccess")}`
            );
          } else {
            window.$message?.error(msg || $t("common.syncFailed"));
          }
        } else {
          // 真正的请求失败
          window.$message?.error($t("common.syncFailed"));
        }
      } else if (response.data) {
        // 请求成功，检查业务状态码
        const { code, msg } = response.data;
        if (code === 0) {
          window.$message?.success(
            `${crossServer.serverName} ${$t("common.syncSuccess")}`
          );
        } else {
          window.$message?.error(msg || $t("common.syncFailed"));
        }
      }
    }

    await getData();
  } catch (error) {
    handleApiCatchError(error, $t("page.manage.servercross.sync"));
  }
}

</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <NCard
      :title="$t('page.manage.servercross.title')"
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
            @sync="handleSync"
            :show-add="hasAuth('game:item:add')"
            :show-batch-delete="hasAuth('game:item:edit')"
            :showsynv="hasAuth('game:gm:syncCrossServer')"
          />
        </NSpace>
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="treeData"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        :row-key="(row) => row.id"
        :pagination="false"
        :children-key="'children'"
        :default-expand-all="true"
        class="sm:h-full"
      />

      <CrossOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />

      <ConfigOperateDrawer
        v-model:visible="groupDrawerVisible"
        :row-data="groupRowData"
        @submitted="handleGroupSubmitted"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
