<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NCard, NDataTable, NSwitch } from "naive-ui";
import {
  fetchGetServerActivityList,
  fetchToggleServerActivity,
} from "@/service/api";
import { useI18n } from "vue-i18n"; // ✅ 改用 useI18n
import { useAppStore } from "@/store/modules/app";
import {
  serverActivityStatusRecord,
  serverActivityStatusOptions,
  activityBigTypeRecord,
  activitySmallTypeRankRecord,
  activitySmallTypeTaskRecord,
  activitySmallTypeMapRecord,
  activitySmallTypeShopRecord,
  activitySmallTypeIncomeRecord,
  activitySmallTypeActivityRecord,
  activitySmallTypeSystemRecord,
} from "@/constants/business";
import { useTable, useTableOperate } from "@/hooks/common/table";
import { format } from "date-fns";
import ServerActivitySearch from "./modules/serveractivity-search.vue";
import { $t } from "@/locales";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuth } from "@/hooks/business/auth";
import { handleApiCatchError, handleApiResponseError } from "@/utils/common";

// i18n
const { t } = useI18n();
const { hasAuth } = useAuth();
const appStore = useAppStore();

// 本地维护活动开启状态
const activityStates = ref(new Map<string, boolean>());

// 轮询定时器
let pollingTimer: NodeJS.Timeout | null = null;

// 解析活动类型
function parseActivityType(activityType: number) {
  if (!activityType) return { bigType: null, smallType: null };
  const bigType = Math.floor(activityType / 10000).toString() as Api.SystemManage.activityBigType;
  const smallType = (activityType % 10000).toString();
  return { bigType, smallType };
}

// const smallTypeMap = {
//   "1": activitySmallTypeRankRecord,
//   "2": activitySmallTypeTaskRecord,
//   "3": activitySmallTypeMapRecord,
//   "4": activitySmallTypeShopRecord,
//   "5": activitySmallTypeIncomeRecord,
//   "6": activitySmallTypeActivityRecord,
// } as const;
// 和 activityBigTypeRecord 保持一致

const smallTypeMap = {
  "1": activitySmallTypeSystemRecord, // 如果有 system
  "2": activitySmallTypeRankRecord,
  "3": activitySmallTypeTaskRecord,
  "4": activitySmallTypeMapRecord,
  "5": activitySmallTypeShopRecord,
  "6": activitySmallTypeIncomeRecord,
};


function getSmallTypeText(bigType: string, smallType: string) {
  const record = smallTypeMap[bigType as keyof typeof smallTypeMap];
  if (record && smallType in record) {
    return t(record[smallType as keyof typeof record]);
  }
  return "未知小类型";
}

function getSmallTypeStyle(bigType: string) {
  // 如果是系统类型（bigType为"1"），使用黄色
  if (bigType === "1") {
    return "px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium border border-yellow-200";
  }
  // 其他类型使用蓝色
  return "px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200";
}

// 处理活动开关状态变化
async function handleActivityToggle(row: any, checked: boolean) {
  try {
    // 检查是否选择了区服
    if (!searchParams.serverId) {
      window.$message?.warning($t('common.pleaseSelectServer'));
      return;
    }

    // 如果满足关闭条件（state > 5），则不允许开启活动
    if (checked && row.state > 5) {
      window.$message?.warning('活动处于关闭状态，无法开启');
      return;
    }

    const tag = checked ? 0 : 1; // 0表示开启，1表示关闭
    const activityKey = `${row.activityGuid}_${row.serverId || searchParams.serverId}`;

    const response = await fetchToggleServerActivity({
      serverId: Number(searchParams.serverId || row.serverId),
      activityGuid: row.activityGuid,
      tag: tag
    });

    // 使用封装好的错误处理方法
    const hasError = handleApiResponseError(response, checked ? '开启活动' : '关闭活动');
    if (hasError) {
      return;
    }

    activityStates.value.set(activityKey, checked);
    window.$message?.success(checked ? '活动开启成功' : '活动关闭成功');
    getData();
  } catch (error) {
    console.error('切换活动状态失败:', error);
    handleApiCatchError(error, checked ? '开启活动' : '关闭活动');
  }
}

// 获取活动开启状态
function getActivityState(row: any): boolean {
  const activityKey = `${row.activityGuid}_${row.serverId || searchParams.serverId}`;
  if (activityStates.value.has(activityKey)) {
    return activityStates.value.get(activityKey) || false;
  }

  // 只有满足关闭条件时才显示为关闭状态，否则都是开启状态
  if (row.state > 5) {
    return false; // 关闭状态
  }

  // 如果 tag === 1，根据本地状态判断，默认为关闭
  if (row.tag === 1) {
    return false;
  }

  return true; // 默认为开启状态
}

// 判断活动开关是否应该被禁用
function isActivityDisabled(row: any): boolean {
  // 只有满足关闭条件时才可以禁用（因为已经是关闭状态）
  // if (row.state > 5 || row.tag === 1) {
  //   return true;
  // }

  return false;
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
} = useTable({
  apiFn: fetchGetServerActivityList,
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
    },
    // {
    //   key: "activityId",
    //   title: t("page.manage.serveractivity.activityId"),
    //   align: "center",
    //   minWidth: 130,
    //   ellipsis: { tooltip: true },
    // },
    {
      key: "activityGuid",
      title: t("page.manage.serveractivity.activityGuid"),
      align: "center",
      minWidth: 130,
      ellipsis: { tooltip: true },
    },
    {
      key: "activityName",
      title: t("page.manage.serveractivity.activityName"),
      align: "center",
      minWidth: 130,
      ellipsis: { tooltip: true },
    },
    {
      key: "activityGuid",
      title: t("page.manage.serveractivity.activityGuid"),
      align: "center",
      minWidth: 130,
      ellipsis: { tooltip: true },
    },
    {
      key: "activityType",
      title: t("page.manage.serveractivity.activityType"),
      align: "center",
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.activityType) return "";
        const { bigType, smallType } = parseActivityType(row.activityType);
        if (!bigType) return row.activityType;

        const bigTypeText = activityBigTypeRecord[bigType]
          ? t(activityBigTypeRecord[bigType])
          : "未知大类型";
        const smallTypeText = getSmallTypeText(bigType, smallType);

        return (
          <div class="space-y-1">
            <div class={`text-xs font-medium ${bigType === "1" ? "text-yellow-600" : "text-gray-600"}`}>{bigTypeText}</div>
            <div class={getSmallTypeStyle(bigType)}>
              {smallTypeText}
            </div>
          </div>
        );
      },
    },
    {
      key: "createTime",
      title: t("page.manage.serveractivity.createTime"),
      align: "center",
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.createTime) return "";
        return format(new Date(row.createTime * 1000), "yyyy-MM-dd HH:mm:ss");
      },
    },
    {
      key: "beginShowTime",
      title: t("page.manage.serveractivity.beginShowTime"),
      align: "center",
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.beginShowTime) return "";
        return format(new Date(row.beginShowTime * 1000), "yyyy-MM-dd HH:mm:ss");
      },
    },
    {
      key: "openTime",
      title: t("page.manage.serveractivity.openTime"),
      align: "center",
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.openTime) return "";
        return format(new Date(row.openTime * 1000), "yyyy-MM-dd HH:mm:ss");
      },
    },
    {
      key: "closeTime",
      title: t("page.manage.serveractivity.closeTime"),
      align: "center",
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.closeTime) return "";
        return format(new Date(row.closeTime * 1000), "yyyy-MM-dd HH:mm:ss");
      },
    },
    {
      key: "removeTime",
      title: t("page.manage.serveractivity.removeTime"),
      align: "center",
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.removeTime) return "";
        return format(new Date(row.removeTime * 1000), "yyyy-MM-dd HH:mm:ss");
      },
    },
    {
      key: "state",
      title: t("page.manage.serveractivity.state"),
      align: "center",
      minWidth: 120,
      render: (row: any) => {
        if (!row.state && row.state !== 0) return <NTag type="info">-</NTag>;

        const stateKey = row.state.toString() as Api.SystemManage.serverState;
        const stateText = serverActivityStatusRecord[stateKey]
          ? t(serverActivityStatusRecord[stateKey])
          : `未知状态(${row.state})`;

        return <NTag type="info">{stateText}</NTag>;
      },
    },
    {
      key: "isActive",
      title: t("page.manage.serveractivity.isActive"),
      align: "center",
      minWidth: 120,
      render: (row: any) => (
        <div class="flex-center gap-8px">
          {hasAuth('operate:relayActivity:buildGmJson') && (
          <NSwitch
            value={getActivityState(row)}
            onUpdateValue={(checked: boolean) => handleActivityToggle(row, checked)}
            disabled={isActivityDisabled(row)}
          />
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
} = useTableOperate(data, getData);

function handleSearch(
  serverId: number,
  activityGuid: string,
  state: string | null,
) {
  updateSearchParams({ serverId, activityGuid, state });
  getData();
}

function handleReset() {
  resetSearchParams();
  getData();
}

// 开始轮询
function startPolling() {
  // 只有在选择了服务器时才开始轮询
  if (!searchParams.serverId) {
    return;
  }

  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  pollingTimer = setInterval(() => {
    getData();
  }, 3000); // 每3秒轮询一次
}

// 停止轮询
function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

// 监听服务器选择变化
watch(
  () => searchParams.serverId,
  (newServerId) => {
    if (newServerId) {
      // 选择了服务器，开始轮询
      startPolling();
    } else {
      // 没有选择服务器，停止轮询
      stopPolling();
    }
  },
  { immediate: true }
);

// 组件卸载时停止轮询
onUnmounted(() => {
  stopPolling();
});


</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <ServerActivitySearch
      v-model:model="searchParams"
      @reset="handleReset"
      @search="handleSearch"
    />
    <NCard
      :title="t('page.manage.serveractivity.title')"
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
        :scroll-x="1080"
        :loading="loading"
        remote
        :row-key="(row: any) => row.activityGuid || row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>
