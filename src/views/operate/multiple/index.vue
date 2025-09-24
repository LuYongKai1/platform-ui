<script setup lang="tsx">
import { NButton, NPopconfirm, NTag, NProgress, NTooltip } from "naive-ui";
import {
  fetchGetMultiMailList,
  fetchDeleteMultiMail,
  fetchSendMultiMail,
  fetchStopMultiMail,
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { useTable, useTableOperate } from "@/hooks/common/table";
import ItemOperateDrawer from "./modules/item-operate-drawer.vue";
import ViewStatusModal from "./modules/view-status-modal.vue";
import MultiMailSearch from "./modules/multi-mail-search.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from '@/hooks/business/auth';
import {
  canStopSending,
  isSendDisabled,
  getMailStatusInfo,
  renderMailExpire,
  renderMailSendDate,
  renderCreateDate,
  createMailPoller,
  handleMailOperation,
  parseSendStatus
} from '@/utils/common';


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
  apiFn: fetchGetMultiMailList,
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
      key: "id",
      title: $t("page.manage.serveritem.id"),
      align: "center",
      width: 64,
    },
    {
      key: "mailRemark",
      title: $t("page.manage.operateserver.mailRemark"),
      align: "center",
      width: 80,
      ellipsis: { tooltip: true }
    },
    {
      key: "mailStatus",
      title: $t("page.manage.operateserver.mailStatus"),
      align: "center",
      width: 80,
      render: (row: any) => renderMailStatus(row.mailStatus)
    },
        {
      key: "mailRolesJson",
      title: $t("page.manage.operateserver.sendStatus"),
      align: "center",
      width: 150,
      render: (row: any) => {
        if (!row.mailRolesJson || row.mailStatus === 0 || row.mailStatus === 1) {
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

        const { success, total, percentage } = parseSendStatus(row.mailRolesJson);

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
      key: "mailTitle",
      title: $t("page.manage.operateserver.mailTitle"),
      align: "center",
      ellipsis: { tooltip: true }
    },
    {
      key: "mailContent",
      title: $t("page.manage.operateserver.mailContent"),
      align: "center",
      minWidth: 80,
      ellipsis: { tooltip: true }
    },
    {
      key: "mailExpire",
      title: $t("page.manage.operateserver.mailExpire"),
      align: "center",
      minWidth: 80,
      render: (row: any) => renderMailExpire(row.mailExpire)
    },
    {
      key: "mailSendDate",
      title: $t("page.manage.operateserver.mailSendDate"),
      align: "center",
      minWidth: 80,
      render: (row: any) => renderMailSendDate(row.mailSendDate)
    },
    {
      key: "createDate",
      title: $t("page.manage.operateserver.createDate"),
      align: "center",
      minWidth: 80,
      render: (row: any) => renderCreateDate(row.createDate)
    },
    {
      key: "updateDate",
      title: $t("page.manage.operateserver.updateDate"),
      align: "center",
      minWidth: 80,
    },
    {
      key: "operate",
      title: $t("common.operate"),
      align: "center",
      width: 280,
      render: (row: any) => (
        <div class="flex-center gap-8px">
          {canStopSending(row.mailStatus) && hasAuth('operate:multipleMail:stop') ? (
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
          ) : hasAuth('operate:multipleMail:start') && (
            <NPopconfirm onPositiveClick={() => handleSendMail(row.id)}>
            {{
              default: () => $t("common.confirmSend"),
              trigger: () => (
                <NButton
                  type="success"
                  ghost
                  size="small"
                  disabled={isSendDisabled(row.mailStatus)}
                >
                  {$t("common.send")}
                </NButton>
              ),
            }}
            </NPopconfirm>
          )}
          {hasAuth('operate:multipleMail:query') && (
            <NButton
            type="info"
            ghost
            size="small"
            onClick={() => handleView(row)}
          >
            {$t("common.view")}
          </NButton>
          )}

          {hasAuth('operate:multipleMail:edit') && (
            <NButton
            type="primary"
            ghost
            size="small"
            onClick={() => edit(row.id, row, isSendDisabled(row.mailStatus) || canStopSending(row.mailStatus))}
          >
            {$t("common.edit")}
          </NButton>
          )}

          {hasAuth('operate:multipleMail:remove') && (
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
} = useTableOperate(data, getData);

const viewModalVisible = ref(false);
const currentViewData = ref<any[]>([]);

// 创建轮询器，使用封装好的轮询工具
const mailPoller = createMailPoller(data, getData);

// 在组件卸载时清理定时器
onUnmounted(() => {
  mailPoller.stopPolling();
});

//批量删除
async function handleBatchDelete() {
  try {
    const deletePromises = checkedRowKeys.value.map((id: string) => {
      return fetchDeleteMultiMail(Number(id));
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
    const response = await fetchDeleteMultiMail(id);

    onDeleted(response);
  } catch (error: any) {
    onDeleted(error);
  }
}
// 发送邮件
async function handleSendMail(id: number) {
  await handleMailOperation(
    fetchSendMultiMail,
    id,
    'send',
    () => {
      getData();
      mailPoller.startPolling();
    },
    (error) => console.error('发送失败:', error)
  );
}
// 停止发送邮件
async function handleStopSendMail(id: number) {
  await handleMailOperation(
    fetchStopMultiMail,
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
    let rolesData;
    if (typeof row.mailRolesJson === "object" && row.mailRolesJson !== null) {
      rolesData = row.mailRolesJson;
    } else if (typeof row.mailRolesJson === "string") {
      try {
        rolesData = JSON.parse(row.mailRolesJson);
      } catch (parseError) {
          rolesData = JSON.parse(JSON.parse(row.mailRolesJson));
      }
    }

    if (Array.isArray(rolesData)) {
      currentViewData.value = rolesData;
      viewModalVisible.value = true;
    }
  } catch (error) {
    console.error("处理角色数据失败:", error);
    window.$message?.error($t("common.error"));
  }
}

function handleSearch() {
  getData();
}

onMounted(() => {
  getData();
});

</script>

<template>
  <div
  class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <MultiMailSearch
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
          :loading="loading"
          @add="() => handleAdd()"
          @delete="handleBatchDelete"
          @refresh="getData"
          :show-add="hasAuth('operate:multipleMail:add')"
          :show-batch-delete="hasAuth('operate:multipleMail:remove')"
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
        :row-key="(row: any) => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <ItemOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :readonly="(editingData)?.isReadonly"
        @submitted="getDataByPage"
      />

      <ViewStatusModal
        v-model:visible="viewModalVisible"
        :server-data="currentViewData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
