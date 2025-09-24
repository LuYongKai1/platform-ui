<script setup lang="tsx">
import {
  NButton,
  NCard,
  NDataTable,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NSpace,
} from "naive-ui";
import {
  fetchServerFileList,
  fetchDownloadServerFile,
  fetchGetFileHash,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { useTable, useTableOperate } from "@/hooks/common/table";
import { handleApiResponseError, handleApiCatchError } from "@/utils/common";
import FileSearch from "./modules/file-search.vue";
import TableHeaderOperation from "@/components/advanced/table-header-operation.vue";
import ServerFileUploadModal from "./modules/file-upload-modal.vue";
import { ref, onMounted, h, resolveComponent } from "vue";
import { useAuth } from "@/hooks/business/auth";
import { format } from "date-fns";

const { hasAuth } = useAuth();
const appStore = useAppStore();

// 创建当前搜索参数的引用
const currentSearchParams = ref({
  path: "",
  serverId: "",
});

// 哈希值弹框相关状态
const hashModalVisible = ref(false);
const hashData = ref({
  fileName: "",
  algo: "",
  hash: "",
});

// 上传文件相关状态
const uploadModalVisible = ref(false);

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
  apiFn: fetchServerFileList as any,
  immediate: false,
  showTotal: true,
  apiParams: currentSearchParams.value,
  columns: () => [
    {
      key: "name",
      title: $t("page.manage.serverFile.name"),
      align: "center",
      minWidth: 120,
    },
    {
      key: "size",
      title: $t("page.manage.serverFile.size"),
      align: "center",
      minWidth: 120,
    },
    {
      key: "lastModified",
      title: $t("page.manage.serverFile.lastModified"),
      align: "center",
      minWidth: 120,
      render: (row: any) => {
        return row.lastModified ? format(new Date(row.lastModified), 'yyyy-MM-dd HH:mm:ss') : '';
      },
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      minWidth: 130,
      render: (row: any) => (
        <div class="flex-center gap-8px">
          {hasAuth("operate:serverFile:download") && (
            <NButton
              type="primary"
              ghost
              size="small"
              onClick={() => handleDownload(row)}
            >
              {$t("common.download")}
            </NButton>
          )}
          {hasAuth("operate:serverFile:hash") && (
            <NButton
              type="primary"
              ghost
              size="small"
              onClick={() => handleHash(row)}
            >
              {$t("common.hash")}
            </NButton>
          )}
        </div>
      ),
    },
  ],
});

const {
  checkedRowKeys,
} = useTableOperate(data, getData);

function handleSearch(serverId: string, rootDirectory: string) {
  currentSearchParams.value = {
    serverId,
    path: rootDirectory,
  };

  // 使用类型断言更新搜索参数
  (updateSearchParams as any)({
    serverId,
    path: rootDirectory,
  });
  getData();
}

// 下载文件功能
async function handleDownload(row: any) {
  try {
    // 检查是否有serverId参数
    if (!currentSearchParams.value.serverId) {
      window.$message?.error($t("page.manage.serverFile.pleaseSelectServer"));
      return;
    }

    // @ts-ignore
    window.$message?.info($t("common.downloadingFile"));

    const response = await fetchDownloadServerFile({
      dir: currentSearchParams.value.path,
      fileName: row.name,
      serverId: currentSearchParams.value.serverId,
    });

    // 使用通用错误处理函数检查响应
    if (handleApiResponseError(response, "下载文件")) {
      return;
    }

    // 检查响应数据是否存在
    if (!response.data) {
      window.$message?.error($t("common.fileDataEmpty"));
      return;
    }

    // 创建 Blob 对象和下载链接
    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = row.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    window.$message?.success($t("common.fileDownloadSuccess"));
  } catch (error: any) {
    handleApiCatchError(error, "下载文件");
  }
}

// 获取文件哈希值功能
async function handleHash(row: any) {
  try {
    // 检查是否有serverId参数
    if (!currentSearchParams.value.serverId) {
      window.$message?.error($t("common.pleaseSelectServer"));
      return;
    }

    const response = await fetchGetFileHash({
      dir: currentSearchParams.value.path,
      fileName: row.name,
      serverId: currentSearchParams.value.serverId,
    });

    // 使用通用错误处理函数检查响应
    if (handleApiResponseError(response, "获取文件哈希值")) {
      return;
    }
        // 检查响应数据是否存在
    if (!response?.response?.data) {
      window.$message?.error($t("common.hashDataEmpty"));
      return;
    }

    const responseData = response.response.data;

    // 从响应中提取真正的哈希数据
    const hashInfo = responseData.data;

    // 设置哈希数据并显示弹框
    hashData.value = {
      fileName: hashInfo.fileName || row.name,
      algo: hashInfo.algo || "unknown",
      hash: hashInfo.hash || "",
    };

    hashModalVisible.value = true;

  } catch (error: any) {
    handleApiCatchError(error, "获取文件哈希值");
  }
}

// 复制哈希值到剪贴板
async function copyHashToClipboard() {
  try {
    await navigator.clipboard.writeText(hashData.value.hash);
    window.$message?.success($t("common.hashCopiedToClipboard"));
  } catch (error) {
    window.$message?.error($t("common.copyFailed"));
  }
}

// 处理上传按钮点击
function handleUpload() {
  uploadModalVisible.value = true;
}

// 处理上传成功
function handleUploadSuccess() {
  uploadModalVisible.value = false;
  getData(); // 刷新文件列表
}


</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <FileSearch
      ref="fileSearchRef"
      v-model:model="currentSearchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    />
    <NCard
      :title="$t('page.manage.serverFile.title')"
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
          @upload="handleUpload"
          :show-upload="hasAuth('operate:serverFile:upload')"

        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns "
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="960"
        :loading="loading"
        remote
        :row-key="(row) => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>

    <ServerFileUploadModal
      v-model:visible="uploadModalVisible"
      :server-id="currentSearchParams.serverId"
      :path="currentSearchParams.path"
      @success="handleUploadSuccess"
    />

    <!-- 哈希值弹框 -->
    <NModal
      v-model:show="hashModalVisible"
      preset="dialog"
      :title="$t('common.hashInfo')"
      style="width: 500px"
    >
      <NDescriptions bordered :column="1">
        <NDescriptionsItem :label="$t('common.fileName')">
          {{ hashData.fileName }}
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('common.hashAlgo')">
          {{ hashData.algo }}
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('common.hashValue')">
          <div class="flex items-center gap-8px">
            <span class="break-all font-mono text-sm">{{ hashData.hash }}</span>
            <NButton
              size="small"
              type="primary"
              ghost
              @click="copyHashToClipboard"
            >
              {{ $t('common.copy') }}
            </NButton>
          </div>
        </NDescriptionsItem>
      </NDescriptions>
    </NModal>
  </div>
</template>

<style scoped>
</style>
