<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from "naive-ui";
import { fetchGetgmrolelist, fetchchatrole, fetchKickRole } from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { enableStatusRecord, userGenderRecord } from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import { useRouterPush } from '@/hooks/common/router';
import UserOperateDrawer from "./modules/user-operate-drawer.vue";
import WhiteSelect from "./modules/white-select.vue";
import { onMounted } from "vue";
import { format } from 'date-fns';
import { useMessage } from 'naive-ui';
import { useAuth } from '@/hooks/business/auth';

const { hasAuth } = useAuth();

const appStore = useAppStore();
const { routerPushByKey } = useRouterPush();
const message = useMessage();

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
  apiFn: fetchGetgmrolelist,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
    openId: null,
    roleId: null,
    roleName: null,
    serverId: null,
    chat: null,
  },
  columns: () => [
    {
      type: "selection",
      align: "center",
      width: 48,
    },
    {
      key: "openId",
      title: $t("page.manage.gmrole.openId"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true }

    },
    {
      key: "roleId",
      title: $t("page.manage.gmrole.roleId"),
      align: "center",
      width: 200,
    },
    {
      key: "roleName",
      title: $t("page.manage.gmrole.roleName"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true }
    },
    {
      key: "serverName",
      title: $t("page.manage.gmrole.serverName"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true }
    },
    {
      key: "chatDate",
      title: $t("page.manage.gmrole.chatDate"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
   
    },
    {
      key: "chatReason",
      title: $t("page.manage.gmrole.chatReason"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true }
    },
    {
      key: "roleType",
      title: $t("page.manage.gmrole.roleType"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "roleLevel",
      title: $t("page.manage.gmrole.roleLevel"),
      align: "center",
      minWidth: 100,
    },
    // {
    //   key: "serverName",
    //   title: $t("page.manage.gmrole.serverName"),
    //   align: "center",
    //   minWidth: 100,
    // },
    // {
    //   key: "vipLevel",
    //   title: $t("page.manage.gmrole.vipLevel"),
    //   align: "center",
    //   width: 130,
    // },
    // {
    //   key: "partyId",
    //   title: $t("page.manage.gmrole.partyId"),
    //   align: "center",
    //   width: 130,
    // },
    // {
    //   key: "partyName",
    //   title: $t("page.manage.gmrole.partyName"),
    //   align: "center",
    //   width: 130,
    // },
    // {
    //   key: "balance",
    //   title: $t("page.manage.gmrole.balance"),
    //   align: "center",
    //   width: 130,
    // },
    // {
    //   key: "ip",
    //   title: $t("page.manage.gmrole.ip"),
    //   align: "center",
    //   width: 130,
    // },

    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 140,
      render: (row: PlayerData) => (
        <div class="flex-center gap-8px">
          {hasAuth('user:role:query') && (
            <NButton
              type="primary"
              ghost
              size="small"
              onClick={() => {
                const params = {
                  roleId: String(row.roleId),
                  roleName: row.roleName
                };
                routerPushByKey('user_rolelist', { query: params });
              }}
            >
              {$t("common.view")}
            </NButton>
          )}

          {hasAuth('user:role:chat') && (
            row.chatDate ? (
              <NPopconfirm
                onPositiveClick={() => handleUnmuteClick(row.roleId)}
                positiveText={$t("common.confirm")}
                negativeText={$t("common.cancel")}
              >
                {{
                  trigger: () => (
                    <NButton type="success" ghost size="small">
                      {$t("common.unchat")}
                    </NButton>
                  ),
                  default: () => $t("common.confirmUnban")
                }}
              </NPopconfirm>
            ) : (
              <NButton
                type="error"
                ghost
                size="small"
                onClick={() => handleMute(row.roleId, row)}
              >
                {$t("common.chat")}
              </NButton>
            )
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


function handleSearch() {
  getData();
}

function handleMute(roleId : number, row: any) {
  const muteData = {
    ...row,
    roleId,
    operationType: 'mute'
  };
  handleEdit(roleId, muteData);
}

// 点击解除禁言按钮
async function handleUnmuteClick(roleId : number) {
  try {
    await fetchchatrole({
      roleId,
      action: 'unchat',
      banChatting: '0,1,2,3,4',
      keepTime: 1,
      banReason: '11'
    });
    getData();
    message.success($t("common.unmuteSuccess"));
  } catch (error) {
    console.error('解除禁言失败:', error);
    message.error($t("common.unmuteFailed"));
  }
}

async function handleBatchKick() {
  if (checkedRowKeys.value.length === 0) {
    return;
  }
  try {
    for (const roleId of checkedRowKeys.value) {
      await fetchKickRole({ roleId: String(roleId) });
    }
    checkedRowKeys.value = [];
    getData();
    message.success($t("common.kickSuccess"));
  } catch (error) {
    window.$message?.error('Batch kick failed');
    console.error('批量踢出用户失败:', error);
    message.error($t("common.kickFailed"));
  }
}

onMounted(() => {
  data.value = [];
});

</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <whiteSelect
      :model="searchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    />

    <NCard
      :title="$t('page.manage.gmrole.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeader
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :disabled-kick="checkedRowKeys.length === 0 || !hasAuth('user:role:kick')"
          :loading="loading"
          @refresh="getData"
          :show-kick="hasAuth('user:role:kick')"
          @kick="handleBatchKick"
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
        :row-key="(row) => row.roleId "
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
