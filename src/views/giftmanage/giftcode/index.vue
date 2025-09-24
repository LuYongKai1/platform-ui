<script setup lang="tsx">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NCard, NDataTable, NButton, NTag, NInput, NSelect, NSpace } from 'naive-ui';
import { fetchGetGiftCodes, fetchExportGiftCodes } from '@/service/api/game-manage';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { format } from 'date-fns';
import { giftActivityTypeRecord } from '@/constants/business';
import { useAppStore } from '@/store/modules/app';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { handleApiCatchError } from '@/utils/common';
import { useAuth } from '@/hooks/business/auth';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { hasAuth } = useAuth();

// 从路由参数获取批次ID和活动名称
const batchId = ref<number | null>(null);
const activityName = ref<string>('');
const isInitializing = ref(false);

// 初始化函数
function initializeFromRoute() {
  // 防止重复初始化
  if (isInitializing.value) {
    return;
  }

  const queryBatchId = route.query.batchId as string;
  const queryActivityName = route.query.activityName as string;

  if (queryBatchId) {
    const newBatchId = parseInt(queryBatchId);

    // 只有当 batchId 真正改变时才更新数据
    if (batchId.value !== newBatchId) {
      isInitializing.value = true;
      batchId.value = newBatchId;
      activityName.value = queryActivityName || '';

      // 使用 nextTick 确保 DOM 更新后再获取数据
      setTimeout(() => {
        if (batchId.value === newBatchId) { // 确保还是当前的 batchId
          getData();
        }
        isInitializing.value = false;
      }, 100);
    } else if (!activityName.value && queryActivityName) {
      // 如果 batchId 相同但活动名称为空，只更新活动名称
      activityName.value = queryActivityName;
    }
  } else {
    // 如果没有批次ID，返回上一页
    window.$message?.warning($t('page.manage.giftCode.pleaseSelectBatch'));
    router.back();
  }
}

onMounted(() => {
  initializeFromRoute();
});

// 监听路由查询参数变化，但只监听 batchId 的变化
watch(() => route.query.batchId, (newBatchId, oldBatchId) => {
  // 只有在真正发生变化且不是初始化时才处理
  if (newBatchId !== oldBatchId && newBatchId) {
    initializeFromRoute();
  }
});

// 表格配置
const {
  columns,
  columnChecks,
  data,
  getData,
  scrollX,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams,
  updateSearchParams,
} = useTable({
  apiFn: (params: any) => {
    // 确保每次调用都使用最新的 batchId，且 batchId 存在
    if (!batchId.value) {
      return Promise.reject(new Error('batchId is required'));
    }
    return fetchGetGiftCodes({ ...params, batchId: batchId.value });
  },
  showTotal: true,
  apiParams: {
    current: 1,
    size: 20,
  },
  columns: () => [
    // @ts-ignore
    {
      key: "id",
      title: $t('page.manage.giftCode.ID'),
      align: "center",
      minWidth: 80,
    },
    // @ts-ignore
    {
      key: "codePlain",
      title: $t('page.manage.giftCode.codePlain'),
      align: "center",
      minWidth: 200,
      ellipsis: { tooltip: true },
      render: (row: any) => (
        <div
          class="cursor-pointer text-blue-500 hover:text-blue-700 font-mono"
          onClick={() => copyCode(row.codePlain)}
          title={$t('page.manage.giftCode.clickCodeToCopy')}
        >
          {row.codePlain}
        </div>
      ),
    },
    // @ts-ignore
    {
      key: "codeType",
      title: $t('page.manage.giftCode.codeType'),
      align: "center",
      minWidth: 80,
      render: (row: any) => {
        if (row.codeType === null) {
          return null;
        }

        const tagMap: Record<string, NaiveUI.ThemeColor> = {
          1: "info",  // 通码 → 蓝色
          2: "error",  // 专码 → 紫色
        };

        const label = $t(giftActivityTypeRecord[row.codeType as keyof typeof giftActivityTypeRecord]);
        return <NTag type={tagMap[row.codeType]} size="small">{label}</NTag>;
      },
    },
    // @ts-ignore
    {
      key: "status",
      title: $t('page.manage.giftCode.status'),
      align: "center",
      minWidth: 100,
      render: (row: any) => {
        const statusMap: Record<number, { label: string; type: NaiveUI.ThemeColor }> = {
          0: { label: "未使用", type: "success" },
          1: { label: "已使用", type: "error" },
          2: { label: "已过期", type: "warning" },
          3: { label: "作废", type: "default" },
        };

        const status = statusMap[row.status] || { label: "未知", type: "default" };
        return <NTag type={status.type} size="small">{status.label}</NTag>;
      },
    },
    // @ts-ignore
    {
      key: "maxRedeemCount",
      title: $t('page.manage.giftCode.maxRedeemCount'),
      align: "center",
      minWidth: 120,
    },
    // @ts-ignore
    {
      key: "redeemedCount",
      title: $t('page.manage.giftCode.redeemedCount'),
      align: "center",
      minWidth: 120,
    },
    // @ts-ignore
    {
      key: "usedByOpenId",
      title: $t('page.manage.giftCode.usedByOpenId'),
      align: "center",
      minWidth: 150,
      ellipsis: { tooltip: true },
      render: (row: any) => row.usedByOpenId || '-',
    },
    // @ts-ignore
    {
      key: "usedTime",
      title: $t('page.manage.giftCode.usedTime'),
      align: "center",
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.usedTime) return '-';
        try {
          return format(new Date(row.usedTime), 'yyyy-MM-dd HH:mm:ss');
        } catch (error) {
          return row.usedTime;
        }
      },
    },
    // @ts-ignore
    {
      key: "createdAt",
      title: $t('page.manage.giftCode.createdAt'),
      align: "center",
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: (row: any) => {
        if (!row.createdAt) return '-';
        try {
          return format(new Date(row.createdAt), 'yyyy-MM-dd HH:mm:ss');
        } catch (error) {
          return row.createdAt;
        }
      },
    },
  ],
});

// 搜索功能
const searchForm = ref({
  codePlain: '',
  status: null as number | null,
  usedByOpenId: '',
});

function handleSearch() {
  updateSearchParams(searchForm.value as any);
  getData();
}

function resetSearch() {
  searchForm.value = {
    codePlain: '',
    status: null,
    usedByOpenId: '',
  };
  updateSearchParams({});
  getData();
}

// 复制兑换码
async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    window.$message?.success(`${$t('page.manage.giftCode.copyCodeSuccess', { code })}`);
  } catch (error) {
    // 兼容性处理
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    window.$message?.success(`${$t('page.manage.giftCode.copyCodeSuccess', { code })}`);
  }
}

// 处理导出兑换码
async function handleExport() {
  if (!batchId.value) {
    window.$message?.error('批次ID不能为空');
    return;
  }

  try {
    // @ts-ignore
    window.$message?.info($t("common.exportingData"));

    // 调用导出兑换码API
    const response = await fetchExportGiftCodes({ batchId: batchId.value });

    // 对于文件下载，直接处理blob响应，不使用通用错误处理
    const blob = (response as any)?.data || (response as any)?.response?.data || response;

    // 检查是否获取到有效的blob数据
    if (!blob || (blob instanceof Blob && blob.size === 0)) {
      // @ts-ignore
      window.$message?.error($t("common.exportFailed"));
      return;
    }

    // 如果响应不是blob，尝试创建blob
    let fileBlob;
    if (blob instanceof Blob) {
      fileBlob = blob;
    } else {
      // 创建blob对象
      fileBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    }

    // 检查文件大小
    if (fileBlob.size === 0) {
      // @ts-ignore
      window.$message?.warning($t("common.exportFailed") + ": 没有数据");
      return;
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `兑换码_批次${batchId.value}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // @ts-ignore
    window.$message?.success($t("common.exportSuccess"));
  } catch (error) {
    // 使用通用异常处理函数
    handleApiCatchError(error, '导出兑换码');
  }
}

// 返回上一页
function goBack() {
  router.back();
}

</script>

<template>
  <div
    class="flex-col gap-16px lt-sm:overflow-auto"
  >    <!-- 页面标题 -->
    <NCard title="兑换码管理" size="small">
      <div class="flex items-center justify-between">
        <div class="text-lg font-semibold">
          {{ activityName ? `${activityName} - ` : '' }}{{$t('page.manage.giftCode.batchId', { batchId })}}
        </div>
        <NButton type="primary" ghost @click="goBack">
          {{$t('page.manage.giftCode.backToGiftActivity')}}
        </NButton>
      </div>
    </NCard>

    <!-- 搜索区域 -->
    <NCard title="搜索条件" size="small">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-16px">
        <div>
          <label class="block text-sm font-medium mb-2">{{$t('page.manage.giftCode.codePlain')}}</label>
          <NInput
            v-model:value="searchForm.codePlain"
            :placeholder="$t('page.manage.giftCode.codePlainPlaceholder')"
            clearable
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{$t('page.manage.giftCode.status')}}</label>
          <NSelect
            v-model:value="searchForm.status"
            :placeholder="$t('page.manage.giftCode.statusPlaceholder')"
            clearable
            :options="[
              { label: '未使用', value: 0 },
              { label: '已使用', value: 1 },
              { label: '已过期', value: 2 },
              { label: '作废', value: 3 }
            ]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{$t('page.manage.giftCode.usedByOpenId')}}</label>
          <NInput
            v-model:value="searchForm.usedByOpenId"
            :placeholder="$t('page.manage.giftCode.usedByOpenIdPlaceholder')"
            clearable
          />
        </div>
        <div class="flex items-end gap-8px">
          <NButton type="primary" @click="handleSearch">
            {{$t('common.search')}}
          </NButton>
          <NButton @click="resetSearch">
            {{$t('common.reset')}}
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 兑换码列表 -->
    <NCard
      title="兑换码列表"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          @refresh="getData"
          :show-add="false"
          :show-batch-delete="false"
          :show-export="hasAuth('operate:giftCode:export')"
          :show-export-confirm="true"
          @export="handleExport"
        />
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :loading="loading"
        remote
        :row-key="(row) => row.id"
        :flex-height="!appStore.isMobile"
        :pagination="mobilePagination"
        :scroll-x="1400"
        class="sm:h-full"
      />
    </NCard>

    <!-- 使用提示 -->
    <NCard size="small">
      <div class="text-center text-gray-500 text-sm">
        💡 {{$t('page.manage.giftCode.clickCodeToCopy')}}
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.flex-col-stretch {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex-1-hidden {
  flex: 1;
  overflow: hidden;
}
</style>
