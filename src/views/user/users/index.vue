<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from "naive-ui";
import {
  fetchGetgmuserlist,
  fetchDeleteUser,
  fetchBanUser,
  fetchchatuser,
  fetchKickUser,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { enableStatusRecord, userGenderRecord } from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import UserOperateDrawer from "./modules/user-operate-drawer.vue";
import WhiteSelect from "./modules/white-select.vue";
import { onMounted, ref } from "vue";
import { format } from "date-fns";
import { useAuth } from "@/hooks/business/auth";

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
  updateSearchParams,
} = useTable({
  apiFn: fetchGetgmuserlist,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
    status: null,
  },
  columns: () => [
    {
      type: "selection",
      align: "center",
      width: 48,
    },
    {
      key: "openId",
      title: $t("page.manage.gmuser.openId"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
    },
    {
      key: "userId",
      title: $t("page.manage.gmuser.userId"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
    },
    {
      key: "channelId",
      title: $t("page.manage.gmuser.channelId"),
      align: "center",
      minWidth: 100,
    },

    {
      key: "ip",
      title: $t("page.manage.gmuser.ip"),
      align: "center",
      minWidth: 100,
    },
    {
      key: "banDate",
      title: $t("page.manage.gmrole.banDate"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        return row.banDate
          ? format(new Date(row.banDate), "yyyy-MM-dd HH:mm:ss")
          : "";
      },
    },
    {
      key: "banReason",
      title: $t("page.manage.gmrole.banReason"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
    },
    {
      key: "chatDate",
      title: $t("page.manage.gmrole.chatDate"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        return row.chatDate
          ? format(new Date(row.chatDate), "yyyy-MM-dd HH:mm:ss")
          : "";
      },
    },
    {
      key: "chatReason",
      title: $t("page.manage.gmrole.chatReason"),
      align: "center",
      minWidth: 100,
      ellipsis: { tooltip: true },
    },
    {
      key: "regDate",
      title: $t("page.manage.gmuser.regDate"),
      align: "center",
      minWidth: 100,
      render: (row: any) => {
        return row.regDate
          ? format(new Date(row.regDate), "yyyy-MM-dd HH:mm:ss")
          : "";
      },
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 130,
      render: (row) => (
        <div class="flex-center gap-8px">
          {/* 封禁/解禁 */}
          {hasAuth("user:record:ban") &&
            (row.banDate ? (
              <NPopconfirm
                onPositiveClick={() => handleUnban(row.userId)}
                positiveText={$t("common.confirm")}
                negativeText={$t("common.cancel")}
              >
                {{
                  trigger: () => (
                    <NButton type="success" ghost size="small">
                      {$t("common.unban")}
                    </NButton>
                  ),
                  default: () => $t("common.confirmUnban"),
                }}
              </NPopconfirm>
            ) : (
              <NButton
                type="error"
                ghost
                size="small"
                onClick={() => edit(row.id, row)}
              >
                {$t("common.ban")}
              </NButton>
            ))}

          {/* 禁言/解除禁言 */}
          {hasAuth("user:record:chat") &&
            (row.chatDate ? (
              <NPopconfirm
                onPositiveClick={() => handleUnmuteClick(row.userId)}
                positiveText={$t("common.confirm")}
                negativeText={$t("common.cancel")}
              >
                {{
                  trigger: () => (
                    <NButton type="success" ghost size="small">
                      {$t("common.unchat")}
                    </NButton>
                  ),
                  default: () => $t("common.confirmUnban"),
                }}
              </NPopconfirm>
            ) : (
              <NButton
                type="error"
                ghost
                size="small"
                onClick={() => handleMute(row.userId, row)}
              >
                {$t("common.chat")}
              </NButton>
            ))}
        </div>
      ),
    },
  ],
});

const { drawerVisible, operateType, editingData, handleEdit, checkedRowKeys } =
  useTableOperate(data, getData);

function handleSearch(channelId: string) {
  updateSearchParams({
    channelId,
  });
  getData();
}

function edit(id: number, row: Api.UserInfo["user"]) {
  const editData = {
    ...row,
  };
  handleEdit(id, editData);
}

function handleMute(userId: number, row: any) {
  const muteData = {
    ...row,
    userId,
    operationType: "mute",
  };
  handleEdit(userId, muteData);
}

async function handleUnban(userId: number) {
  try {
    await fetchBanUser({
      userId,
      action: "unban",
      keepTime: 1,
      banReason: "sss",
    });
    window.$message?.success($t("common.unbanSuccess"));
    getData();
  } catch (error) {
    window.$message?.error($t("common.unbanFailed"));
    console.error("解封用户失败:", error);
  }
}

async function handleUnmuteClick(userId: number) {
  try {
    await fetchchatuser({
      userId,
      action: "unchat",
      banChatting: "0,1,2,3,4",
      keepTime: 1,
      banReason: "11",
    });
    window.$message?.success($t("common.unmuteSuccess"));
    getData();
  } catch (error) {
    window.$message?.error($t("common.unmuteFailed"));
    console.error("解除禁言失败:", error);
  }
}

function handleBatchBan() {
  console.warn("handleBatchBan not implemented");
  window.$message?.warning("Batch Ban not implemented");
}
function handleBatchMute() {
  console.warn("handleBatchMute not implemented");
  window.$message?.warning("Batch Mute not implemented");
}

async function handleBatchKick() {
  if (checkedRowKeys.value.length === 0) {
    return;
  }
  try {
    for (const userId of checkedRowKeys.value) {
      await fetchKickUser({ userId: String(userId) });
    }
    window.$message?.success($t("common.kickSuccess"));
    checkedRowKeys.value = [];
    getData();
  } catch (error) {
    window.$message?.error($t("common.kickFailed"));
    console.error("批量踢出用户失败:", error);
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
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    />

    <NCard
      :title="$t('page.manage.gmuser.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeader
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :disabled-kick="checkedRowKeys.length === 0"
          :loading="loading"
          @ban="handleBatchBan"
          @mute="handleBatchMute"
          @kick="handleBatchKick"
          @refresh="getData"
          :show-kick="hasAuth('user:record:kick')"
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
        :row-key="(row) => row.userId"
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
