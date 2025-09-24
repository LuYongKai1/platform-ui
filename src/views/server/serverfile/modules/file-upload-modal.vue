<script setup lang="ts">
import { ref, watch } from "vue";
import { $t } from "@/locales";
import { fetchUploadServerFile } from "@/service/api";
import { handleApiResponseError, handleApiCatchError } from "@/utils/common";

defineOptions({
  name: "ServerFileUploadModal",
});

interface Props {
  serverId?: string;
  path?: string;
}

interface Emits {
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 文件相关状态
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const uploading = ref(false);

const visible = defineModel<boolean>("visible", {
  default: false,
});

watch(visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

// 选择文件
function selectFile() {
  fileInputRef.value?.click();
}

// 处理文件选择
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    return;
  }

  // 检查文件大小（限制为100MB）
  const maxSize = 100 * 1024 * 1024;
  const validFiles: File[] = [];
  const invalidFiles: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > maxSize) {
      invalidFiles.push(file.name);
    } else {
      validFiles.push(file);
    }
  }

  // 显示文件大小超限的文件
  if (invalidFiles.length > 0) {
    window.$message?.error(
      $t("common.fileSizeExceeded") + `: ${invalidFiles.join(", ")}`
    );
  }

  // 添加有效文件到选中列表
  if (validFiles.length > 0) {
    selectedFiles.value.push(...validFiles);
    window.$message?.success(
      $t("common.selectedFiles", { count: validFiles.length })
    );
  }

  // 清空文件输入
  target.value = "";
}

// 移除选中的文件
function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

// 清空所有文件
function clearAllFiles() {
  selectedFiles.value = [];
}

// 确认上传
async function confirmUpload() {
  if (selectedFiles.value.length === 0) {
    window.$message?.warning($t("common.pleaseSelectFile"));
    return;
  }

  if (!props.serverId) {
    window.$message?.error($t("common.pleaseSelectServer"));
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();

    // 添加所有选中的文件
    selectedFiles.value.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("serverId", props.serverId);
    formData.append("path", props.path || "");

    const response = await fetchUploadServerFile(formData);

    if (handleApiResponseError(response, "上传文件")) {
      return;
    }

    window.$message?.success($t("common.uploadSuccess"));
    emit("success");
    closeModal();
  } catch (error: any) {
    // 使用通用异常处理函数
    handleApiCatchError(error, "上传文件");
  } finally {
    uploading.value = false;
  }
}

function closeModal() {
  visible.value = false;
}

function resetForm() {
  selectedFiles.value = [];
  uploading.value = false;
}
</script>

<template>
  <div>
    <!-- 隐藏的文件输入元素 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 上传文件模态对话框 -->
    <NModal v-model:show="visible" :mask-closable="true">
      <NCard
        style="width: 600px"
        title="上传服务器文件"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        closable
        @close="closeModal"
      >
        <div class="space-y-4">
          <!-- 提示信息 -->
          <NAlert type="info" :show-icon="true">
            <span>
              {{ $t("common.pleaseSelectFilesToUpload") }}
            </span>
          </NAlert>

          <!-- 操作按钮 -->
          <div class="flex gap-4">
            <NButton type="primary" :disabled="uploading" @click="selectFile">
              {{ $t("common.selectFiles") }}
            </NButton>
            <NButton
              v-if="selectedFiles.length > 0"
              :disabled="uploading"
              @click="clearAllFiles"
            >
              {{ $t("common.clearAll") }}
            </NButton>
          </div>

          <!-- 已选择的文件列表 -->
          <div v-if="selectedFiles.length > 0" class="file-list">
            <div class="text-sm  mb-2">
              {{ $t("common.selectedFiles") }}: {{ selectedFiles.length }} 个文件
            </div>
            <div class="max-h-40 overflow-y-auto">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-2  rounded mb-2"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ file.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ (file.size / 1024 / 1024).toFixed(2) }}MB
                  </div>
                </div>
                <NButton
                  size="small"
                  quaternary
                  type="error"
                  :disabled="uploading"
                  @click="removeFile(index)"
                >
                  {{ $t("common.remove") }}
                </NButton>
              </div>
            </div>
          </div>

          <!-- 服务器信息 -->
          <div v-if="props.serverId" class="text-sm ">
            {{ $t("common.targetServer") }}: {{ props.serverId }}
            <br v-if="props.path" />
            <span v-if="props.path">{{ $t("common.uploadPath") }}: {{ props.path }}</span>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-4">
            <NButton :disabled="uploading" @click="closeModal">
              {{ $t("common.cancel") }}
            </NButton>
            <NButton type="primary" :loading="uploading" @click="confirmUpload">
              {{ $t("common.confirm") }}
            </NButton>
          </div>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}


</style>
