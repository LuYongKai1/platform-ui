<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NCard, NDataTable, NProgress, NTooltip } from "naive-ui";
import {
  fetchGetMailList,
  fetchDeleteMail,
  fetchSendMail,
  fetchStopMail,
  fetchCancelMail,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { useTable, useTableOperate } from "@/hooks/common/table";
import { ref, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import { useAuth } from '@/hooks/business/auth';
import {
  mailStatusMap,
  canStopSending,
  isSendDisabled,
  getMailStatusInfo,
  renderMailExpire,
  renderMailSendDate,
  renderCreateDate,
  createMailPoller,
  handleMailOperation,
  parseServerJson,
  parseServerSendStatus
} from '@/utils/common';
import ServerMailSearch from "./modules/server-mail-search.vue";
import TableHeaderOperation from "@/components/advanced/table-header-operation.vue";
const MailOperateDrawer = defineAsyncComponent(() => import("./modules/mail-operate-drawer.vue"));
const ViewStatusModal = defineAsyncComponent(() => import("./modules/view-status-modal.vue"));

const { hasAuth } = useAuth();

const appStore = useAppStore();

// 渲染邮件状态
const renderMailStatus = (status: number) => {
  const statusInfo = getMailStatusInfo(status);
  return <NTag type={statusInfo.type}>{statusInfo.label}</NTag>;
};

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
  apiFn: fetchGetMailList,
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
      key: "id" as any,
      title: $t("page.manage.serveritem.id"),
      align: "center",
      width: 64,
    },
    {
      key: "mailRemark" as any,
      title: $t("page.manage.operateserver.mailRemark"),
      align: "center",
      width: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: "mailStatus" as any,
      title: $t("page.manage.operateserver.mailStatus"),
      align: "center",
      width: 80,
      render: (row: any) => renderMailStatus(row.mailStatus)
    },
    {
      key: "mailServerJson" as any,
      title: $t("page.manage.operateserver.sendStatus"),
      align: "center",
      width: 150,
      render: (row: any) => {
        if (!row.mailServerJson || row.mailStatus === 0 || row.mailStatus === 1) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <NTooltip trigger="hover">
              {{
                trigger: () => (
                  <div
                    style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#D3D3D3',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleView(row)}
                  />
                ),
                default: () => (
                  <div>
                    <div>{$t("page.manage.operateserver.notSend")}</div>
                  </div>
                )
              }}
            </NTooltip>
            </div>
          );
        }

        const { success, total, percentage } = parseServerSendStatus(row.mailServerJson);

        if (total === 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: '#909399', fontSize: '12px' }}>{$t("page.manage.operateserver.noData")}</span>
              <NProgress
                percentage={100}
                status="default"
                strokeWidth={6}
                showIndicator={false}
                style={{ width: '100px' }}
              />
            </div>
          );
        }

        const failed = total - success;
        const failedPercentage = total > 0 ? Math.round((failed / total) * 100) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
            <NTooltip trigger="hover">
              {{
                trigger: () => (
                  <div
                    style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#F0F0F0',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleView(row)}
                  >
                    {/* 成功部分（绿色） */}
                    {success > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: '#67C23A',
                        borderRadius: '4px 0 0 4px'
                      }} />
                    )}

                    {/* 失败部分（红色） */}
                    {failed > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: `${percentage}%`,
                        top: '0',
                        height: '100%',
                        width: `${failedPercentage}%`,
                        backgroundColor: '#F56C6C',
                        borderRadius: percentage === 0 ? '4px' : '0 4px 4px 0'
                      }} />
                    )}
                  </div>
                ),
                default: () => (
                  <div>
                    <div>{$t("page.manage.operateserver.total")}: {total} {$t("page.manage.operateserver.item")}</div>
                    <div style={{ color: '#67C23A' }}>{$t("page.manage.operateserver.success")}: {success} {$t("page.manage.operateserver.item")}</div>
                    <div style={{ color: '#F56C6C' }}>{$t("page.manage.operateserver.failed")}: {failed} {$t("page.manage.operateserver.item")}</div>
                  </div>
                )
              }}
            </NTooltip>
          </div>
        );
      }
    },
    {
      key: "mailTitle" as any,
      title: $t("page.manage.operateserver.mailTitle"),
      align: "center",
      width: 120,
      ellipsis: { tooltip: true }
    },
    {
      key: "mailContent" as any,
      title: $t("page.manage.operateserver.mailContent"),
      align: "center",
      minWidth: 80,
      ellipsis: { tooltip: true }
    },
    {
      key: "mailExpire" as any,
      title: $t("page.manage.operateserver.mailExpire"),
      align: "center",
      width: 120,
      render: (row: any) => renderMailExpire(row.mailExpire)
    },
    {
      key: "mailSendDate" as any,
      title: $t("page.manage.operateserver.mailSendDate"),
      align: "center",
      minWidth: 80,
      render: (row: any) => renderMailSendDate(row.mailSendDate)
    },
    {
      key: "createDate" as any,
      title: $t("page.manage.operateserver.createDate"),
      align: "center",
      minWidth: 80,
      render: (row: any) => renderCreateDate(row.createDate)
    },
    {
      key: "updateDate" as any,
      title: $t("page.manage.operateserver.updateDate"),
      align: "center",
      minWidth: 80,
    },
    {
      key: "operate" as any,
      title: $t("common.operate"),
      align: "center",
      width: 280,
      render: (row: any) => (
        <div class="flex-center gap-8px">
          {canStopSending(row.mailStatus) && hasAuth('operate:serverMail:stop') ? (
            <NPopconfirm onPositiveClick={() => handleStopSendMail(row.id)}>
            {{
              default: () => $t("common.confirmStop"),
              trigger: () => (
                <NButton type="warning" ghost size="small">
                  {$t("common.stop")}
                </NButton>
              ),
            }}
            </NPopconfirm>
          ) : hasAuth('operate:serverMail:start') && (
            <NPopconfirm onPositiveClick={() => handleSendMail(row.id)}>
            {{
              default: () => $t("common.confirmSend"),
              trigger: () => (
                <NButton type="success" ghost size="small" disabled={isSendDisabled(row.mailStatus)}>
                  {$t("common.send")}
                </NButton>
              ),
            }}
            </NPopconfirm>
          )}
          {hasAuth('operate:serverMail:query') && (
            <NButton
            type="info"
            ghost
            size="small"
            onClick={() => handleView(row)}
          >
            {$t("common.view")}
          </NButton>
          )}
          {hasAuth('operate:serverMail:edit') && (
          <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row, isSendDisabled(row.mailStatus) || canStopSending(row.mailStatus))}
          >
            {$t("common.edit")}
          </NButton>
          )}
          {hasAuth('operate:serverMail:remove') && (
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

const viewModalVisible = ref(false);
const currentViewData = ref<any[]>([]);

// 创建轮询器
const mailPoller = createMailPoller(data, getData);

// 在组件卸载时清理定时器
onUnmounted(() => {
  mailPoller.stopPolling();
});

//批量删除
async function handleBatchDelete() {
  try {
    const deletePromises = checkedRowKeys.value.map((id: string) => {
      return fetchDeleteMail({ id: Number(id) });
    });
    const responses = await Promise.all(deletePromises);

    onBatchDeleted(responses);
  } catch (error: any) {
    onBatchDeleted(error);
  }
}
// 删除邮件
async function handleDelete(id: number) {
  try {
    const response = await fetchDeleteMail({ id });

    onDeleted(response);
  } catch (error: any) {
    onDeleted(error);
  }
}

// 发送邮件
async function handleSendMail(id: number) {
  await handleMailOperation(
    fetchSendMail,
    id,
    'send',
    () => {
      getData();
      mailPoller.startPolling();
    },
    (error) => console.error('发送失败:', error)
  );
}

async function handleStopSendMail(id: number) {
  await handleMailOperation(
    fetchStopMail,
    id,
    'stop',
    () => {
      getData();
      mailPoller.stopPolling();
    },
    (error) => console.error('停止失败:', error)
  );
}

function edit(id: number, row: any, isReadonly = false) {
  const editData = {
    ...row,
    isReadonly
  };
  handleEdit(id, editData);
}

function handleView(row: any) {
  try {
    const serverData = parseServerJson(row.mailServerJson);
    if (serverData.length > 0) {
      currentViewData.value = serverData;
      viewModalVisible.value = true;
    }
  } catch (error) {
    console.error("处理服务器数据失败:", error);
    window.$message?.error($t("common.error"));
  }
}

async function handleCancelMail() {
  if (checkedRowKeys.value.length === 0) {
    window.$message?.warning($t("common.selectMailFirst"));
    return;
  }

  try {
    for (const id of checkedRowKeys.value) {
      await handleMailOperation(
        fetchCancelMail,
        Number(id),
        'cancel',
        undefined,
        (error) => console.error('取消失败:', error)
      );
    }
    checkedRowKeys.value = [];
    getData();
  } catch (error) {
    console.error("取消邮件失败:", error);
    window.$message?.error($t("common.cancelFailed"));
  }
}
function handleSearch() {
  getData();
}

onMounted(() => {
  data.value = [];
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ServerMailSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="handleSearch"
    />
    <NCard
      :title="$t('page.manage.operateserver.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :disabled-cancel="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
          @cancel="handleCancelMail"
          :show-add="hasAuth('operate:serverMail:add')"
          :show-batch-delete="hasAuth('operate:serverMail:remove')"
          :show-cancel="hasAuth('operate:serverMail:withdraw')"
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

      <MailOperateDrawer
        v-model:visible="drawerVisible"
        @submitted="getDataByPage"
        :operate-type="operateType"
        :row-data="editingData"
        :readonly="editingData?.isReadonly"
      />
      <ViewStatusModal
        v-model:visible="viewModalVisible"
        :server-data="currentViewData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
