<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick, unref } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import {
  fetchGetChannelList,
  fetchGetServeritemAdd,
  fetchGetServeritemUpdate,
  fetchGetServerGroup,
  fetchgetServerInfo,
} from "@/service/api";
import { $t } from "@/locales";
import {
  serverStatusShowOptions,
  serverVisibleOptions,
  serverRecommendOptions,
  serverNewOptions,
  serverStatusaddaddShowOptions,
} from "@/constants/business";
import { NUl, NCheckboxGroup, NCheckbox, NSpace } from "naive-ui";
import type { FormItemRule, FormRules, NDatePicker } from "naive-ui";
import { handleApiResponseError, handleApiCatchError } from "@/utils/common";

const DEFAULT_GM_PORT = "30108";
const DEFAULT_GM_PATH = "/mirm_api/service/gm";

// 服务器发货地址
const DEFAULT_CALLBACK_PORT = "8864";
const DEFAULT_CALLBACK_PATH = "/mirm_api/service/payment";

defineOptions({
  name: "CrossOperateDrawer",
});

interface ServerGroupItem {
  id: number;
  groupName: string;
}

interface ServerGroupResponseData {
  rows: ServerGroupItem[];
}

interface ServerGroupApiResponse {
  response?: {
    data?: ServerGroupResponseData;
  };
  code?: number;
  message?: string;
  status?: string;
  success?: boolean;
  timestamp?: number;
  type?: string;
}

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.serveritem | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: "submitted"): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>("visible", {
  default: false,
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

// Flag to prevent watchers from interfering during initialization
const isInitializing = ref(false);

const validateNumber = (
  _rule: FormItemRule,
  value: string | number
): true | Error => {
  if (!value) return true;
  const strValue = String(value);
  if (!/^\d+$/.test(strValue)) {
    return new Error("只能输入数字");
  }
  return true;
};

const validateIp = (_rule: FormItemRule, value: string): true | Error => {
  if (!value) return true;
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(value)) {
    return new Error("请输入有效的IP地址");
  }
  return true;
};

const validateHttpUrl = (_rule: FormItemRule, value: string): true | Error => {
  if (!value) return true;
  if (!/^https?:\/\/.+/.test(value)) {
    return new Error("请输入有效的HTTP/HTTPS URL");
  }
  return true;
};

const rules: FormRules = {
  groupId: [
    {
      required: true,
      message: $t("form.required"),
      type: "number",
      trigger: ["blur", "change"],
    },
  ],
  serverId: [
    {
      required: true,
      message: $t("page.manage.serveritem.form.serverId"),
      trigger: ["input", "blur"],
    },
    { validator: validateNumber, trigger: ["input", "blur"] },
  ],
  serverName: [
    {
      required: true,
      message: $t("form.required"),
      trigger: ["input", "blur"],
    },
  ],
  serverIp: [
    {
      required: true,
      message: $t("page.manage.serveritem.form.serverIp"),
      trigger: ["input", "blur"],
    },
    { validator: validateIp, trigger: ["input", "blur"] },
  ],
  serverPort: [
    {
      required: true,
      message: $t("page.manage.serveritem.form.serverPort"),
      trigger: ["input", "blur"],
    },
    { validator: validateNumber, trigger: ["input", "blur"] },
  ],
  intranetIp: [{ validator: validateIp, trigger: ["input", "blur"] }],
  serverOpenDate: [
    {
      required: true,
      type: "number",
      message: $t("form.required"),
      trigger: ["blur", "change"],
    },
  ],
  urlCallback: [],
  urlGm: [
    {
      required: true,
      message: $t("page.manage.serveritem.form.urlGm"),
      trigger: ["input", "blur"],
    },
    { validator: validateHttpUrl, trigger: ["input", "blur"] },
  ],
  serverStatus: [
    {
      required: true,
      message: $t("form.required"),
      trigger: ["blur", "change"],
    },
  ],
  extendParam: [],
  busyUser: [
    {
      required: true,
      message: $t("form.required"),
      trigger: ["input", "blur"],
    },
    { validator: validateNumber, trigger: ["input", "blur"] },
    {
      validator: (_rule: FormItemRule, value: string | number) => {
        if (!value) return true;
        const numValue = Number(value);
        const maxUserValue = Number(model.value.maxUser);
        if (isNaN(numValue) || isNaN(maxUserValue) || maxUserValue === 0)
          return true;
        if (numValue >= maxUserValue) {
          return new Error("忙碌人数不能大于等于最大人数");
        }
        return true;
      },
      trigger: ["input", "blur", "change"],
    },
  ],
  fullUser: [
    {
      required: true,
      message: $t("form.required"),
      trigger: ["input", "blur"],
    },
    { validator: validateNumber, trigger: ["input", "blur"] },
    {
      validator: (_rule: FormItemRule, value: string | number) => {
        if (!value) return true;
        const numValue = Number(value);
        const maxUserValue = Number(model.value.maxUser);
        if (isNaN(numValue) || isNaN(maxUserValue) || maxUserValue === 0)
          return true;
        if (numValue >= maxUserValue) {
          return new Error("满员人数不能大于等于最大人数");
        }
        return true;
      },
      trigger: ["input", "blur", "change"],
    },
  ],
  maxUser: [
    {
      required: true,
      message: $t("form.required"),
      trigger: ["input", "blur", "change"],
    },
    { validator: validateNumber, trigger: ["input", "blur"] },
  ],
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.serveritem.addserveritem"),
    edit: $t("page.manage.serveritem.editserveritem"),
  };
  return titles[props.operateType];
});

type EnableStatus = string;

type Model = Omit<
  Api.SystemManage.serveritem,
  | "serverOpenDate"
  | "id"
  | "createTime"
  | "updateTime"
  | "delFlag"
  | "groupId"
  | "status"
  | "serverNew"
  | "serverRecommend"
  | "serverHot"
  | "serverTypeCategory"
> & {
  serverOpenDate: number | null;
  groupId: number | null;
  status: EnableStatus | null;
  serverNew: number | null;
  serverNewUI: "0" | "1";
  serverRecommendUI: "0" | "1";
  serverHotUI: "0" | "1";
  noCreateRoleUI: "0" | "1";
  busyUser: string;
  fullUser: string;
  maxUser: string;
  serverType: string;
};

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    groupId: null,
    serverId: "",
    serverName: "",
    serverIp: "",
    serverPort: "",
    intranetIp: "",
    serverOpenDate: null,
    urlCallback: "",
    urlGm: "",
    serverVisible: "VISIBLE",
    serverStatus: "",
    serverNew: null,
    extendParam: "",
    status: null,
    createBy: "",
    updateBy: "",
    serverNewUI: "0",
    serverRecommendUI: "0",
    serverHotUI: "0",
    noCreateRoleUI: "0",
    busyUser: "0",
    fullUser: "0",
    maxUser: "",
    serverType: "CROSS",
  };
}
const serverGroupOptions = ref<CommonType.Option<number>[]>([]);

async function getServerGroupOptions() {
  try {
    const data: any = await fetchGetServerGroup();
    const rows = data?.response?.data?.rows;
    if (rows && Array.isArray(rows)) {
      serverGroupOptions.value = rows.map((item: ServerGroupItem) => ({
        label: item.groupName,
        value: item.id,
      }));
    } else {
      console.error("获取服务器组数据格式不正确或为空:", data);
      serverGroupOptions.value = [];
    }
  } catch (err) {
    console.error("获取服务器组列表失败:", err);
    window.$message?.error($t("common.requestFailed"));
  }
}

function formatTimestamp(timestamp: number | null): string | null {
  if (timestamp === null) {
    return null;
  }
  try {
    return new Date(timestamp).toISOString();
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return null;
  }
}

function handleInitModel() {
  isInitializing.value = true;
  try {
    model.value = createDefaultModel();
    if (props.operateType === "edit" && props.rowData) {
      const {
        serverOpenDate,
        groupId,
        status,
        serverId,
        serverPort,
        serverNew,
        busyUser,
        fullUser,
        maxUser,
        ...rest
      } = props.rowData;

      let openDateTimestamp: number | null = null;
      if (serverOpenDate && typeof serverOpenDate === "string") {
        try {
          openDateTimestamp = new Date(serverOpenDate).getTime();
        } catch (e) {
          console.error("无法解析开服时间:", serverOpenDate);
        }
      } else if (typeof serverOpenDate === "number") {
        openDateTimestamp = serverOpenDate;
      }

      const backendServerNew =
        serverNew !== undefined && serverNew !== null ? Number(serverNew) : 0;

      model.value = {
        ...model.value,
        ...rest,
        groupId:
          groupId !== undefined && groupId !== null ? Number(groupId) : null,
        serverOpenDate: openDateTimestamp,
        status: status !== undefined ? status : null,
        serverId: serverId !== undefined ? String(serverId) : "",
        serverPort: serverPort !== undefined ? String(serverPort) : "",
        serverNew: backendServerNew,
        busyUser:
          busyUser !== undefined && busyUser !== null ? String(busyUser) : "0",
        fullUser:
          fullUser !== undefined && fullUser !== null ? String(fullUser) : "0",
        maxUser:
          maxUser !== undefined && maxUser !== null ? String(maxUser) : "",
        serverType: "CROSS",
      };

      // 将后端的十进制值拆分为各个开关状态
      model.value.serverNewUI = backendServerNew & 1 ? "1" : "0";
      model.value.serverRecommendUI = backendServerNew & 2 ? "1" : "0";
      model.value.serverHotUI = backendServerNew & 4 ? "1" : "0";
      model.value.noCreateRoleUI = backendServerNew & 8 ? "1" : "0";
    }

    // 如果公网IP已有值，但GM地址为空，设置默认GM地址
    nextTick(() => {
      syncGmUrlWithIp();
    });
  } finally {
    nextTick(() => {
      isInitializing.value = false;
    });
  }
}

// 同步公网IP到GM地址和回调地址的函数
function syncGmUrlWithIp() {
  const { serverIp, urlGm, urlCallback } = model.value;
  if (serverIp && (!urlGm || urlGm.trim() === "")) {
    model.value.urlGm = `http://${serverIp}:${DEFAULT_GM_PORT}${DEFAULT_GM_PATH}`;
  }
  // 只在新增时补全urlCallback，编辑时不处理
  if (props.operateType === "add" && serverIp && (!urlCallback || urlCallback.trim() === "")) {
    model.value.urlCallback = `http://${serverIp}:${DEFAULT_CALLBACK_PORT}${DEFAULT_CALLBACK_PATH}`;
  }
}

// 添加同步状态和函数
const isSyncing = ref(false);
const syncSuccess = ref(false);

// 处理GM地址同步
async function handleGmSync() {
  if (!model.value.urlGm || model.value.urlGm.trim() === "") {
    window.$message?.warning($t("page.manage.serveritem.syncFailedTip"));
    return;
  }

  isSyncing.value = true;
  syncSuccess.value = false;

  try {
    const response = await fetchgetServerInfo({ gmUrl: model.value.urlGm });

    // 检查响应数据
    const responseData = response?.data || response?.response?.data || response;
    if (responseData && responseData.code === 0) {
      // code为0表示成功
      window.$message?.success($t("page.manage.serveritem.syncSuccess"));
      syncSuccess.value = true;
    } else {
      // code为-1或其他值表示失败
      const errorMsg = responseData?.msg || $t("page.manage.serveritem.syncFailed");
      window.$message?.error(errorMsg);
      syncSuccess.value = false;
    }
  } catch (error) {
    console.error("GM地址同步失败:", error);
    window.$message?.error($t("page.manage.serveritem.syncFailedTip2"));
    syncSuccess.value = false;
  } finally {
    isSyncing.value = false;
  }
}

function closeDrawer() {
  visible.value = false;
  // 重置同步状态
  syncSuccess.value = false;
}

async function handleSubmit() {
  // 检查是否已同步成功
  if (!syncSuccess.value) {
    window.$message?.warning($t("page.manage.serveritem.syncFailedTip2"));
    return;
  }

  await validate();
  try {
    const formattedDate = formatTimestamp(model.value.serverOpenDate);

    // 使用位运算将四个开关状态转为十进制
    let finalServerNew = 0;
    if (model.value.serverNewUI === "1") finalServerNew |= 1;
    if (model.value.serverRecommendUI === "1") finalServerNew |= 2; // 0010
    if (model.value.serverHotUI === "1") finalServerNew |= 4; // 0100
    if (model.value.noCreateRoleUI === "1") finalServerNew |= 8; // 1000

    const {
      serverNewUI,
      serverRecommendUI,
      serverHotUI,
      noCreateRoleUI,
      ...baseModelData
    } = model.value;

    const dataToSend = {
      ...baseModelData,
      serverOpenDate: formattedDate,
      serverNew: finalServerNew,
    };

    let response;
    const operationType = props.operateType === "add" ? "添加" : "修改";

    if (props.operateType === "add") {
      response = await fetchGetServeritemAdd(dataToSend);

      // 检查API响应是否有错误
      if (handleApiResponseError(response, operationType)) {
        return;
      }

      window.$message?.success($t("common.addSuccess"));
    } else {
      if (!props.rowData?.id) {
        window.$message?.error("缺少更新所需的服务器ID");
        return;
      }
      const updateData = { ...dataToSend, id: props.rowData.id };
      response = await fetchGetServeritemUpdate(updateData);

      // 检查API响应是否有错误
      if (handleApiResponseError(response, operationType)) {
        return;
      }

      window.$message?.success($t("common.updateSuccess"));
    }

    closeDrawer();
    emit("submitted");
  } catch (error) {
    const operationType = props.operateType === "add" ? "添加" : "修改";
    handleApiCatchError(error, operationType);
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    handleInitModel();
    restoreValidation();
    getServerGroupOptions();
    // 重置同步状态
    syncSuccess.value = false;
    isSyncing.value = false;
  } else {
  }
});

watch(
  () => props.rowData,
  (newRowData) => {
    if (visible.value && props.operateType === "edit" && newRowData) {
      handleInitModel();
    }
  },
  { deep: true }
);

watch(
  () => model.value.serverHotUI,
  (newVal) => {
    if (isInitializing.value) return;
    if (newVal === "1") {
      model.value.serverRecommendUI = "0";
    }
  }
);

watch(
  () => model.value.serverRecommendUI,
  (newVal) => {
    if (isInitializing.value) return;
    if (newVal === "1") {
      model.value.serverHotUI = "0";
    }
  }
);

watch(
  [
    () => model.value.busyUser,
    () => model.value.fullUser,
    () => model.value.maxUser,
  ],
  ([busyUser, fullUser, maxUser]) => {
    if (isInitializing.value) return;

    if (!formRef.value) return;

    if (busyUser && fullUser && maxUser) {
      nextTick(() => {
        formRef.value?.restoreValidation();
      });
    }

    if (Number(maxUser) > 0) {
      if (Number(busyUser) < Number(maxUser)) {
        formRef.value?.restoreValidation();
      }

      if (Number(fullUser) < Number(maxUser)) {
        formRef.value?.restoreValidation();
      }
    }
  },
  { deep: true }
);

watch(
  () => model.value.serverIp,
  (newIp) => {
    if (isInitializing.value) return;
    if (!newIp) return;

    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIp)) return;

    updateGmUrlWithNewIp(newIp);
  }
);

function updateGmUrlWithNewIp(newIp: string) {
  // 更新GM地址
  const currentGmUrl = model.value.urlGm;
  if (!currentGmUrl || currentGmUrl.trim() === "") {
    model.value.urlGm = `http://${newIp}:${DEFAULT_GM_PORT}${DEFAULT_GM_PATH}`;
  } else {
    try {
      const urlPattern = /^(https?:\/\/)[^\/:]+(:[0-9]+)?(\/.*)?$/;
      const match = currentGmUrl.match(urlPattern);

      if (match) {
        const protocol = match[1] || "http://";
        const port = match[2] || `:${DEFAULT_GM_PORT}`;
        const path = match[3] || DEFAULT_GM_PATH;
        model.value.urlGm = `${protocol}${newIp}${port}${path}`;
      } else {
        model.value.urlGm = `http://${newIp}:${DEFAULT_GM_PORT}${DEFAULT_GM_PATH}`;
      }
    } catch (e) {
      console.error("处理GM地址时出错:", e);
      model.value.urlGm = `http://${newIp}:${DEFAULT_GM_PORT}${DEFAULT_GM_PATH}`;
    }
  }

  // 只在新增时更新回调地址，编辑时不处理
  if (props.operateType === "add") {
    const currentCallbackUrl = model.value.urlCallback;
    if (!currentCallbackUrl || currentCallbackUrl.trim() === "") {
      model.value.urlCallback = `http://${newIp}:${DEFAULT_CALLBACK_PORT}${DEFAULT_CALLBACK_PATH}`;
    } else {
      try {
        const urlPattern = /^(https?:\/\/)[^\/:]+(:[0-9]+)?(\/.*)?$/;
        const match = currentCallbackUrl.match(urlPattern);

        if (match) {
          const protocol = match[1] || "http://";
          const port = match[2] || `:${DEFAULT_CALLBACK_PORT}`;
          const path = match[3] || DEFAULT_CALLBACK_PATH;
          model.value.urlCallback = `${protocol}${newIp}${port}${path}`;
        } else {
          model.value.urlCallback = `http://${newIp}:${DEFAULT_CALLBACK_PORT}${DEFAULT_CALLBACK_PATH}`;
        }
      } catch (e) {
        console.error("处理回调地址时出错:", e);
        model.value.urlCallback = `http://${newIp}:${DEFAULT_CALLBACK_PORT}${DEFAULT_CALLBACK_PATH}`;
      }
    }
  }
}
</script>


<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-620px pr-20px">
      <NForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="left"
        :label-width="100"
      >
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.serverId')"
            path="serverId"
          >
            <NInput
              v-model:value="model.serverId"
              :placeholder="$t('page.manage.serveritem.form.serverId')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.serverName')"
            path="serverName"
          >
            <NInput
              v-model:value="model.serverName"
              :placeholder="$t('page.manage.serveritem.form.serverName')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.serverIp')"
            path="serverIp"
          >
            <NInput
              v-model:value="model.serverIp"
              :placeholder="$t('page.manage.serveritem.form.serverIp')"
              @update:value="(val) => updateGmUrlWithNewIp(val)"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.serverPort')"
            path="serverPort"
          >
            <NInput
              v-model:value="model.serverPort"
              :placeholder="$t('page.manage.serveritem.form.serverPort')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.intranetIp')"
            path="intranetIp"
          >
            <NInput
              v-model:value="model.intranetIp"
              :placeholder="$t('page.manage.serveritem.form.intranetIp')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.serverOpenDate')"
            path="serverOpenDate"
          >
            <NDatePicker
              v-model:value="model.serverOpenDate"
              type="datetime"
              clearable
              :placeholder="$t('page.manage.serveritem.form.serverOpenDate')"
              style="width: 100%"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.busyUser')"
            path="busyUser"
          >
            <NInputNumber
              :value="Number(model.busyUser)"
              @update:value="
                (val) => (model.busyUser = val !== null ? String(val) : '0')
              "
              :placeholder="$t('page.manage.serveritem.form.busyUser')"
              style="width: 100%"
              :min="0"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.serveritem.fullUser')"
            path="fullUser"
          >
            <NInputNumber
              :value="Number(model.fullUser)"
              @update:value="
                (val) => (model.fullUser = val !== null ? String(val) : '0')
              "
              :placeholder="$t('page.manage.serveritem.form.fullUser')"
              style="width: 100%"
              :min="0"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.serveritem.maxUser')"
            path="maxUser"
            style="white-space: nowrap"
          >
            <NInputNumber
              :value="Number(model.maxUser)"
              @update:value="
                (val) => (model.maxUser = val !== null ? String(val) : '')
              "
              :placeholder="$t('page.manage.serveritem.form.maxUser')"
              style="width: 100%"
              :min="0"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.serveritem.urlCallback')"
            path="urlCallback"
            style="white-space: nowrap"
          >
            <NInput
              v-model:value="model.urlCallback"
              :placeholder="$t('page.manage.serveritem.form.urlCallback')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:20"
            :label="$t('page.manage.serveritem.urlGm')"
            path="urlGm"
          >
            <NInput
              v-model:value="model.urlGm"
              :placeholder="$t('page.manage.serveritem.form.urlGm')"
            />
          </NFormItemGi>

          <!-- 添加同步按钮 -->
          <NFormItemGi span="24 m:4">
            <NButton
              @click="handleGmSync"
              type="primary"
              style="width: 92%; margin-left: 8px"
              :loading="isSyncing"
              :disabled="!model.urlGm || model.urlGm.trim() === ''"
            >
              {{ $t("common.sync") }}
            </NButton>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:6"
            :label="$t('page.manage.serveritem.serverNew')"
            path="serverNewUI"
          >
            <NSwitch
              v-model:value="model.serverNewUI"
              :checked-value="'1'"
              :unchecked-value="'0'"
              :placeholder="$t('page.manage.serveritem.form.serverNew')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:6"
            :label="$t('page.manage.serveritem.serverRecommend')"
            path="serverRecommendUI"
          >
            <NSwitch
              v-model:value="model.serverRecommendUI"
              :checked-value="'1'"
              :unchecked-value="'0'"
              :disabled="model.serverHotUI === '1'"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:6"
            :label="$t('page.manage.serveritem.serverRecommendNew')"
            path="serverHotUI"
          >
            <NSwitch
              v-model:value="model.serverHotUI"
              :checked-value="'1'"
              :unchecked-value="'0'"
              :disabled="model.serverRecommendUI === '1'"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:6"
            :label="$t('page.manage.serveritem.noCreateRole')"
            path="noCreateRoleUI"
          >
            <NSwitch
              v-model:value="model.noCreateRoleUI"
              :checked-value="'1'"
              :unchecked-value="'0'"
            />
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.serveritem.serverVisible')"
            path="serverVisible"
          >
            <NRadioGroup v-model:value="model.serverVisible">
              <NRadio
                v-for="item in serverVisibleOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi> -->

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.serveritem.serverStatus')"
            path="serverStatus"
          >
            <NRadioGroup v-model:value="model.serverStatus">
              <NRadio
                v-for="item in serverStatusaddaddShowOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi>

          <NFormItemGi
            span="24"
            :label="$t('page.manage.serverregion.groupList')"
            path="groupId"
          >
            <NSpace vertical>
              <NRadioGroup v-model:value="model.groupId">
                <NSpace>
                  <NRadio
                    v-for="item in serverGroupOptions"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </NRadio>
                </NSpace>
              </NRadioGroup>
            </NSpace>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.serveritem.extendParam')"
            path="extendParam"
          >
            <NInput
              v-model:value="model.extendParam"
              :placeholder="$t('page.manage.serveritem.form.extendParam')"
            />
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">{{ $t("common.cancel") }}</NButton>
        <NButton
          type="primary"
          @click="handleSubmit"
          :loading="isSyncing"
          :disabled="!syncSuccess"
        >
          {{ $t("common.confirm") }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>

<script lang="ts">
export default {
  name: 'CrossOperateDrawer'
}
</script>
