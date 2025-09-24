<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import type { Ref } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import type { FormRules, FormItemRule, FormInst } from "naive-ui";
import {
  fetchAddMail,
  fetchUpdateMail,
  fetchGetServerGroup,
  fetchGetMailTemplateList,
  fetchAndStoreCsPackageData,
} from "@/service/api";
import { $t } from "@/locales";
import { useServerStore } from "@/store/modules/server";
import { getJsonData, safeJsonParse } from "@/utils/indexedDB";
import { useThemeStore } from "@/store/modules/theme";
import { useItemPackage } from "@/hooks/business/useItemPackage";

defineOptions({
  name: "MailOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?:
    | (Api.SystemManage.operateServer & {
        isReadonly?: boolean;
        mailStatus?: number;
      })
    | null;
  /** 外部传入的只读 */
  readonly?: boolean;
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
const typedFormRef = formRef as Ref<FormInst | null>;
const { defaultRequiredRule } = useFormRules();

// 添加表单验证规则
const rules: Record<string, FormRules | FormItemRule> = {
  mailRemark: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailId: { ...defaultRequiredRule, trigger: ["change", "blur"] },
  mailTitle: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailContent: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailServerJson: {
    required: true,
    message: $t("page.manage.operateserver.form.mailServerJson"),
    trigger: ["change", "blur"],
    validator: (rule: FormItemRule, value: string) => {
      try {
        return selectedServerIds.value.length > 0;
      } catch {
        return false;
      }
    },
  },
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.operateserver.addservermail"),
    edit: $t("page.manage.operateserver.editservermail"),
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.operateServer,
  | "mailRemark"
  | "mailId"
  | "mailTitle"
  | "mailExpire"
  | "mailContent"
  | "mailSendDate"
  | "mailServerJson"
  | "activeFrom"
  | "activeTo"
  | "goodsJson"
  | "createRoleAfter"
  | "createRoleBefore"
>;

const model = ref(createDefaultModel());

// --- Helper Functions for Time Formatting ---
function getCurrentFormattedTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getOneMonthLaterFormattedTime(): string {
  const now = new Date();
  now.setMonth(now.getMonth() + 1); // Add one month
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function convertToTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  if (dateStr.includes("+")) {
    return null;
  }
  try {
    const [datePart, timePart] = dateStr.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Math.floor(date.getTime() / 1000);
  } catch (error) {
    return null;
  }
}

function convertToString(timestamp: number | null): string {
  if (!timestamp) return "";
  try {
    const milliseconds =
      String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return result;
  } catch (error) {
    return "";
  }
}

function createDefaultModel(): Model {
  return {
    mailRemark: "",
    mailId: "8888",
    mailTitle: "",
    mailExpire: "",
    mailContent: "",
    mailSendDate: "",
    mailServerJson: "",
    activeFrom: "",
    activeTo: "",
    goodsJson: "",
    createRoleAfter: "",
    createRoleBefore: "",
  };
}

// Add a ref to control the date range switch
const enableDateRange = ref(false);

// 添加是否启用角色创建时间限制的开关
const enableRoleCreateTimeRange = ref(false);

// 相对时间设置
const relativeTime = ref({
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

// 快速选择预设时间
const quickTimeOptions = [
  { label: "1 天", value: { days: 1 } },
  { label: "3 天", value: { days: 3 } },
  { label: "7 天", value: { days: 7 } },
  { label: "15 天", value: { days: 15 } },
  { label: "30 天", value: { days: 30 } },
  { label: "3 个月", value: { months: 3 } },
];

// 有效期限选项
const timeOptions = [
  { label: "自定义时长", value: "custom" },
  { label: "1 天", value: "day_1" },
  { label: "3 天", value: "day_3" },
  { label: "7 天", value: "day_7" },
  { label: "15 天", value: "day_15" },
  { label: "30 天", value: "day_30" },
  { label: "3 个月", value: "month_3" },
];

// 添加选择的预设选项
const selectedTimeOption = ref<any>(null);

// 处理预设时间选项变更
function handleTimeOptionChange(option: any) {
  if (option === "custom") {
    // 自定义选项不需要应用预设值
    return;
  }

  // 重置所有时间单位
  relativeTime.value = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  // 根据选项设置相应的时间
  if (option === "day_1") {
    relativeTime.value.days = 1;
  } else if (option === "day_3") {
    relativeTime.value.days = 3;
  } else if (option === "day_7") {
    relativeTime.value.days = 7;
  } else if (option === "day_15") {
    relativeTime.value.days = 15;
  } else if (option === "day_30") {
    relativeTime.value.days = 30;
  } else if (option === "month_3") {
    relativeTime.value.months = 3;
  }

  // 应用时间
  applyRelativeTime();
}

// 监听相对时间变化
watch(
  relativeTime,
  () => {
    applyRelativeTime();
  },
  { deep: true }
);

// 计算总秒数
const totalSeconds = computed(() => {
  let seconds = 0;
  seconds += (relativeTime.value.years || 0) * 365 * 24 * 60 * 60;
  seconds += (relativeTime.value.months || 0) * 30 * 24 * 60 * 60;
  seconds += (relativeTime.value.days || 0) * 24 * 60 * 60;
  seconds += (relativeTime.value.hours || 0) * 60 * 60;
  seconds += (relativeTime.value.minutes || 0) * 60;
  seconds += relativeTime.value.seconds || 0;
  return seconds;
});

// 添加新计算属性：计算过期时间秒数（不显示）
const mailExpireSeconds = computed(() => {
  if (selectedTimeOption.value === "day_1") {
    return 1 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "day_3") {
    return 3 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "day_7") {
    return 7 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "day_15") {
    return 15 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "day_30") {
    return 30 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "month_3") {
    return 90 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === "custom") {
    return totalSeconds.value;
  }
  return 0;
});

// 格式化自定义时间显示
const formattedCustomTime = computed(() => {
  const parts = [];
  if (relativeTime.value.years) parts.push(`${relativeTime.value.years} 年`);
  if (relativeTime.value.months) parts.push(`${relativeTime.value.months} 月`);
  if (relativeTime.value.days) parts.push(`${relativeTime.value.days} 天`);
  if (relativeTime.value.hours) parts.push(`${relativeTime.value.hours} 小时`);
  if (relativeTime.value.minutes)
    parts.push(`${relativeTime.value.minutes} 分钟`);
  if (relativeTime.value.seconds)
    parts.push(`${relativeTime.value.seconds} 秒`);

  return parts.length > 0 ? parts.join(" ") : "未设置";
});

function applyRelativeTime() {
  const now = new Date();

  if (relativeTime.value.years)
    now.setFullYear(now.getFullYear() + relativeTime.value.years);
  if (relativeTime.value.months)
    now.setMonth(now.getMonth() + relativeTime.value.months);
  if (relativeTime.value.days)
    now.setDate(now.getDate() + relativeTime.value.days);
  if (relativeTime.value.hours)
    now.setHours(now.getHours() + relativeTime.value.hours);
  if (relativeTime.value.minutes)
    now.setMinutes(now.getMinutes() + relativeTime.value.minutes);
  if (relativeTime.value.seconds)
    now.setSeconds(now.getSeconds() + relativeTime.value.seconds);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
}

// 应用预设时间
function applyQuickTime(option: any) {
  // 重置所有时间单位
  relativeTime.value = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  Object.assign(relativeTime.value, option.value);

  applyRelativeTime();
}

// 监听相对时间变化
watch(
  relativeTime,
  () => {
    applyRelativeTime();
  },
  { deep: true }
);

const mailExpireTimestamp = computed({
  get: () => {
    const timestamp = convertToTimestamp(model.value.mailExpire);
    return timestamp ? timestamp * 1000 : null;
  },
  set: (val) => {
    if (val === null) {
      model.value.mailExpire = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.mailExpire = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const mailSendDateTimestamp = computed({
  get: () => {
    if (model.value.mailSendDate) {
      try {
        const date = new Date(model.value.mailSendDate);
        return date.getTime();
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  set: (val) => {
    if (val === null) {
      model.value.mailSendDate = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.mailSendDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const createDateTimestamp = computed({
  get: () => {
    const timestamp = convertToTimestamp(model.value.activeFrom);
    return timestamp ? timestamp * 1000 : null;
  },
  set: (val) => {
    if (val === null) {
      model.value.activeFrom = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.activeFrom = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const updateDateTimestamp = computed({
  get: () => {
    const timestamp = convertToTimestamp(model.value.activeTo);
    return timestamp ? timestamp * 1000 : null;
  },
  set: (val) => {
    if (val === null) {
      model.value.activeTo = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.activeTo = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const createRoleBeforeTimestamp = computed({
  get: () => {
    const timestamp = convertToTimestamp(model.value.createRoleBefore);
    return timestamp ? timestamp * 1000 : null;
  },
  set: (val) => {
    if (val === null) {
      model.value.createRoleBefore = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.createRoleBefore = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const createRoleAfterTimestamp = computed({
  get: () => {
    const timestamp = convertToTimestamp(model.value.createRoleAfter);
    return timestamp ? timestamp * 1000 : null;
  },
  set: (val) => {
    if (val === null) {
      model.value.createRoleAfter = "";
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      model.value.createRoleAfter = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
});

const serverGroupOptions = ref<CommonType.Option<number>[]>([]);
// Define a more specific type for mailTemplateOptions
interface MailTemplateOption extends CommonType.Option<string> {
  template: {
    title: string;
    content: string;
  };
}
const mailTemplateOptions = ref<MailTemplateOption[]>([]);

const serverStore = useServerStore();
const serverTreeOptions = computed(() => serverStore.serverTreeOptions);

// 修改selectedServerIds的计算属性
const selectedServerIds = ref<string[]>([]);

// 监听mailServerJson的变化
watch(
  () => model.value.mailServerJson,
  (newVal) => {
    try {
      const ids = JSON.parse(newVal);
      selectedServerIds.value = Array.isArray(ids)
        ? ids.map((id) => String(id))
        : [];
    } catch {
      selectedServerIds.value = [];
    }
  },
  { immediate: true }
);

watch(selectedServerIds, (val) => {
  const filteredIds = val.filter((id) => !String(id).startsWith("region_"));
  model.value.mailServerJson = JSON.stringify(filteredIds);
});

async function getServerGroupOptions() {
  const data = await fetchGetServerGroup();
  const responseData = data?.response?.data as {
    rows?: { groupName: string; id: number }[];
  };
  if (responseData?.rows && Array.isArray(responseData.rows)) {
    serverGroupOptions.value = responseData.rows.map(
      (item: { groupName: string; id: number }) => ({
        label: item.groupName,
        value: item.id,
      })
    );
  }
}

const isTemplateSelected = computed(
  () => !!model.value.mailId && model.value.mailId !== "8888"
);

async function getMailTemplateOptions() {
  const data = await fetchGetMailTemplateList();
  const responseData = data?.response?.data as { mails?: any[] };
  if (responseData && responseData.mails) {
    mailTemplateOptions.value = responseData.mails.map((item: any) => ({
      label: `${item.title_str} (${item.name_str})`,
      value: String(item.mail_id),
      template: {
        title: item.title_str,
        content: item.description_str,
      },
    }));

    mailTemplateOptions.value.unshift({
      label: "自定义模板",
      value: "8888",
      template: {
        title: "",
        content: "",
      },
    });
  }
}

// 添加邮件模板选择处理函数
function handleTemplateChange(mailId: string | null) {
  if (mailId) {
    if (mailId === "8888") {
      model.value.mailTitle = "";
      model.value.mailContent = "";
    } else {
      const selectedTemplate = mailTemplateOptions.value.find(
        (option) => option.value === mailId
      );
      if (selectedTemplate) {
        model.value.mailTitle = selectedTemplate.template.title;
        model.value.mailContent = selectedTemplate.template.content;
      }
    }
  } else {
    // 清空选择时，重置标题和内容
    model.value.mailTitle = "";
    model.value.mailContent = "";
  }
}

// 监听mailId的变化
watch(
  () => model.value.mailId,
  (newVal) => {
    handleTemplateChange(newVal);
    // 在模板更改并填充值后，清除所有验证状态
    restoreValidation();
    // 注意：这会清除所有字段的验证状态。
    // 如果需要，可以在之后显式地重新触发其他字段的验证，
    // 但通常当用户与那些字段交互时，验证会自动触发。
  }
);

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  try {
    const itemIds: number[] = [];
    const itemCounts: number[] = [];

    if (selectedItems.value.length > 0) {
      selectedItems.value.forEach((item) => {
        itemIds.push(Number(item.id));
        itemCounts.push(Number(item.count));
      });

      model.value.goodsJson = JSON.stringify({
        item_ids: itemIds,
        item_counts: itemCounts,
      });
    } else {
      model.value.goodsJson = '{"item_ids": [], "item_counts": []}';
    }

    let mailServerJson = [];
    if (model.value.mailServerJson) {
      try {
        const serverIds = JSON.parse(model.value.mailServerJson);
        mailServerJson = serverIds.map((id: string | number) => {
          const server = serverStore.serverList.find(
            (s) => s.serverId === Number(id)
          );
          return {
            serverId: Number(id),
            serverName: server?.serverName || "",
          };
        });
      } catch (e) {
        mailServerJson = [];
      }
    }

    // 直接使用计算好的秒数
    const expireSeconds = mailExpireSeconds.value;

    // 确保时间戳是秒级的，如果为空则发送0
    const activeFromDate = model.value.activeFrom
      ? convertToTimestamp(model.value.activeFrom)
      : 0;
    const activeToDate = model.value.activeTo
      ? convertToTimestamp(model.value.activeTo)
      : 0;
    const createRoleAfterDate = model.value.createRoleAfter
      ? convertToTimestamp(model.value.createRoleAfter)
      : 0;
    const createRoleBeforeDate = model.value.createRoleBefore
      ? convertToTimestamp(model.value.createRoleBefore)
      : 0;

    const data = {
      id: props.rowData?.id,
      mailRemark: model.value.mailRemark,
      mailId: model.value.mailId,
      mailTitle: model.value.mailTitle,
      mailExpire: expireSeconds, // 直接使用计算好的秒数
      mailContent: model.value.mailContent,
      mailSendDate: model.value.mailSendDate,
      mailServerJson: JSON.stringify(mailServerJson),
      goodsJson: model.value.goodsJson,
      activeFrom: activeFromDate,
      activeTo: activeToDate,
      item_ids: itemIds,
      item_counts: itemCounts,
      createRoleAfter: createRoleAfterDate,
      createRoleBefore: createRoleBeforeDate,
      mailType: 1,
      gameId: 101,
    };

    if (props.operateType === "add") {
      await fetchAddMail(data);
      window.$message?.success($t("common.addSuccess"));
      selectedItems.value = [];
      selectedServerIds.value = [];
    } else {
      await fetchUpdateMail(data);
      window.$message?.success($t("common.updateSuccess"));
    }
    closeDrawer();
    emit("submitted");
  } catch (error) {}
}

interface Server {
  serverId: number;
  serverName: string;
}

interface Region {
  id: number;
  regionName: string;
  children?: Server[];
}

const goodsSearchValue = ref("");
const searchResults = ref<{ id: string; name: string; names: string }[]>([]);
const selectedItems = ref<{ id: string; names: string; count: number }[]>([]);
const itemData = ref<any>(null);

onMounted(async () => {
  try {
    const data = await useItemPackage();
    itemData.value = data;
  } catch (error) {
    console.error("获取物品数据失败:", error);
    itemData.value = null;
  }
});

// 添加搜索方法
function handleSearch(value: string) {
  if (!value) {
    searchResults.value = [];
    return;
  }

  const results: { id: string; name: string; names: string }[] = [];
  const searchValue = value.toLowerCase();

  // 从itemData中获取数据
  if (itemData.value?.data?.item) {
    const items = itemData.value.data.item;
    Object.entries(items).forEach(([id, item]: [string, any]) => {
      const itemName = item.name || String(id);
      const itemNames = item.names || "";
      if (
        String(id).includes(searchValue) ||
        itemName.toLowerCase().includes(searchValue) ||
        itemNames.toLowerCase().includes(searchValue)
      ) {
        results.push({
          id: String(id),
          name: itemName,
          names: itemNames,
        });
      }
    });
  }

  searchResults.value = results;
}

// 添加物品
function addItem(item: { id: string; name: string; names: string }) {
  const existingItem = selectedItems.value.find((i) => i.id === item.id);
  if (!existingItem) {
    selectedItems.value.push({ ...item, count: 1 });
    updateGoodsJson();
  }
  searchResults.value = [];
  goodsSearchValue.value = "";
}

// 更新数量
function updateItemCount(itemId: string, count: number) {
  const item = selectedItems.value.find((i) => i.id === itemId);
  if (item) {
    item.count = count;
  }
  updateGoodsJson();
}

function removeItem(itemId: string) {
  selectedItems.value = selectedItems.value.filter((i) => i.id !== itemId);
  updateGoodsJson();
}

function updateGoodsJson() {
  const itemIds = selectedItems.value.map((item) => Number(item.id));
  const itemCounts = selectedItems.value.map((item) => Number(item.count));

  model.value.goodsJson = JSON.stringify({
    item_ids: itemIds,
    item_counts: itemCounts,
  });
}

// 修改watch函数，使用从IndexedDB获取的物品数据
watch(visible, async (newVal) => {
  if (newVal) {
    restoreValidation();
    // 先加载邮件模板数据，确保在设置model.value.mailId之前已经有了mailTemplateOptions
    await getMailTemplateOptions();
    await getServerGroupOptions();
    serverStore.fetchServerList();
    // fetchItemData();

    // 清空搜索相关的状态
    goodsSearchValue.value = "";
    searchResults.value = [];

    // Get current time and one month later time using helper functions
    const currentTime = getCurrentFormattedTime();
    const oneMonthLaterTime = getOneMonthLaterFormattedTime();

    if (props.operateType === "edit" && props.rowData) {
      const data = props.rowData;
      let serverIds: string[] = [];
      try {
        const serverData = JSON.parse(data.mailServerJson || "[]");
        serverIds = serverData.map((item: any) => String(item.serverId));
      } catch (e) {}

      model.value = {
        mailRemark: data.mailRemark || "",
        mailId: String(data.mailId || ""),
        mailTitle: data.mailTitle || "",
        mailExpire: data.mailExpire
          ? convertToString(Number(data.mailExpire))
          : oneMonthLaterTime,
        mailContent: data.mailContent || "",
        mailSendDate: data.mailSendDate || currentTime,
        mailServerJson: JSON.stringify(serverIds),
        goodsJson: data.goodsJson || '{"item_ids":[],"item_counts":[]}',
        activeFrom: data.activeFrom
          ? convertToString(Number(data.activeFrom))
          : "",
        activeTo: data.activeTo ? convertToString(Number(data.activeTo)) : "",
        createRoleAfter: data.createRoleAfter
          ? convertToString(Number(data.createRoleAfter))
          : "",
        createRoleBefore: data.createRoleBefore
          ? convertToString(Number(data.createRoleBefore))
          : "",
      };

      selectedServerIds.value = serverIds;

      // 处理物品数据
      if (model.value.goodsJson) {
        try {
          const goodsData = JSON.parse(model.value.goodsJson);

          const itemIds = goodsData.item_ids || [];
          const itemCounts = goodsData.item_counts || [];

          selectedItems.value = itemIds.map((id: number, index: number) => {
            let itemInfo = {
              name: String(id),
              names: "",
            };

            if (itemData.value?.data?.item) {
              const item = itemData.value.data.item[id];
              if (item) {
                itemInfo = {
                  name: item.name || String(id),
                  names: item.names || "",
                };
              }
            }

            return {
              id: String(id),
              name: itemInfo.name,
              names: itemInfo.names,
              count: itemCounts[index] || 1,
            };
          });
        } catch (e) {
          console.error("解析goodsJson失败:", e);
          selectedItems.value = [];
        }
      }

      // 设置默认时间选项
      if (data.mailExpire) {
        const mailExpireTimestamp = Number(data.mailExpire);
        // 30天对应的秒数
        if (mailExpireTimestamp === 30 * 24 * 60 * 60) {
          selectedTimeOption.value = "day_30";
        }
        // 15天对应的秒数
        else if (mailExpireTimestamp === 15 * 24 * 60 * 60) {
          selectedTimeOption.value = "day_15";
        }
        // 7天对应的秒数
        else if (mailExpireTimestamp === 7 * 24 * 60 * 60) {
          selectedTimeOption.value = "day_7";
        }
        // 3天对应的秒数
        else if (mailExpireTimestamp === 3 * 24 * 60 * 60) {
          selectedTimeOption.value = "day_3";
        }
        // 1天对应的秒数
        else if (mailExpireTimestamp === 1 * 24 * 60 * 60) {
          selectedTimeOption.value = "day_1";
        }
        // 3个月对应的秒数 (简化为90天)
        else if (mailExpireTimestamp === 90 * 24 * 60 * 60) {
          selectedTimeOption.value = "month_3";
        }
        // 如果不是预设值，则设置为自定义
        else {
          selectedTimeOption.value = "custom";
          // 设置自定义时间值
          const days = Math.floor(mailExpireTimestamp / (24 * 60 * 60));
          const hours = Math.floor(
            (mailExpireTimestamp % (24 * 60 * 60)) / (60 * 60)
          );
          const minutes = Math.floor((mailExpireTimestamp % (60 * 60)) / 60);
          const seconds = mailExpireTimestamp % 60;

          if (days >= 30) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            relativeTime.value.months = months;
            relativeTime.value.days = remainingDays;
          } else {
            relativeTime.value.days = days;
          }

          relativeTime.value.hours = hours;
          relativeTime.value.minutes = minutes;
          relativeTime.value.seconds = seconds;
        }
      } else {
        // 默认选择1天
        selectedTimeOption.value = "day_1";
        relativeTime.value = {
          years: 0,
          months: 0,
          days: 1,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }
    } else {
      model.value = {
        ...createDefaultModel(),
        mailExpire: oneMonthLaterTime,
        mailSendDate: currentTime,
        activeFrom: "",
        activeTo: "",
        createRoleAfter: "",
        createRoleBefore: "",
      };
      selectedItems.value = [];
      selectedServerIds.value = [];

      // 默认选择1天
      selectedTimeOption.value = "day_1";
      // 设置相应的时间单位
      relativeTime.value = {
        years: 0,
        months: 0,
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
      applyRelativeTime();
    }

    enableDateRange.value = false;
    enableRoleCreateTimeRange.value = false;

    if (props.operateType === "edit" && props.rowData) {
      // 检查活动时间范围
      if (props.rowData.activeFrom && props.rowData.activeTo) {
        if (
          Number(props.rowData.activeFrom) !== 0 &&
          Number(props.rowData.activeTo) !== 0
        ) {
          enableDateRange.value = true;
        }
      }

      // 检查角色创建时间范围
      if (props.rowData.createRoleAfter && props.rowData.createRoleBefore) {
        if (
          Number(props.rowData.createRoleAfter) !== 0 &&
          Number(props.rowData.createRoleBefore) !== 0
        ) {
          enableRoleCreateTimeRange.value = true;
        }
      }
    }
  }
});

watch(
  () => props.rowData,
  async (newVal) => {
    if (visible.value && props.operateType === "edit" && newVal) {
      // 确保模板选项已加载
      if (mailTemplateOptions.value.length === 0) {
        await getMailTemplateOptions();
      }

      const data = newVal;
      let serverIds: string[] = [];
      try {
        const serverData = JSON.parse(data.mailServerJson || "[]");
        serverIds = serverData.map((item: any) => String(item.serverId));
      } catch (e) {
        console.error("解析mailServerJson失败:", e);
      }

      // Get current time and one month later time using helper functions
      const currentTime = getCurrentFormattedTime();
      const oneMonthLaterTime = getOneMonthLaterFormattedTime();

      // 处理时间戳 - Use helper functions for defaults
      const mailExpireDate = data.mailExpire
        ? convertToString(Number(data.mailExpire))
        : oneMonthLaterTime;
      const mailSendDate = data.mailSendDate
        ? convertToString(Number(data.mailSendDate))
        : currentTime;

      // 修改这里：确保在非0的情况下才转换时间戳
      const activeFromDate =
        data.activeFrom && Number(data.activeFrom) !== 0
          ? convertToString(Number(data.activeFrom))
          : "";
      const activeToDate =
        data.activeTo && Number(data.activeTo) !== 0
          ? convertToString(Number(data.activeTo))
          : "";
      const createRoleAfterDate =
        data.createRoleAfter && Number(data.createRoleAfter) !== 0
          ? convertToString(Number(data.createRoleAfter))
          : "";
      const createRoleBeforeDate =
        data.createRoleBefore && Number(data.createRoleBefore) !== 0
          ? convertToString(Number(data.createRoleBefore))
          : "";

      model.value = {
        mailRemark: data.mailRemark || "",
        mailId: String(data.mailId || ""),
        mailTitle: data.mailTitle || "",
        mailExpire: mailExpireDate,
        mailContent: data.mailContent || "",
        mailSendDate: mailSendDate,
        mailServerJson: JSON.stringify(serverIds),
        goodsJson: data.goodsJson || '{"item_ids":[],"item_counts":[]}',
        activeFrom: activeFromDate,
        activeTo: activeToDate,
        createRoleAfter: createRoleAfterDate,
        createRoleBefore: createRoleBeforeDate,
      };

      selectedServerIds.value = serverIds;

      // Initialize the switch state based on existing dates
      enableDateRange.value = false;
      enableRoleCreateTimeRange.value = false;

      // 检查活动时间范围
      if (
        props.operateType === "edit" &&
        props.rowData &&
        props.rowData.activeFrom &&
        props.rowData.activeTo
      ) {
        // Check if timestamps are not 0 (assuming 0 means unset/default)
        if (
          Number(props.rowData.activeFrom) !== 0 &&
          Number(props.rowData.activeTo) !== 0
        ) {
          enableDateRange.value = true;
        }
      }

      // 检查角色创建时间范围
      if (
        props.operateType === "edit" &&
        props.rowData &&
        props.rowData.createRoleAfter &&
        props.rowData.createRoleBefore
      ) {
        // Check if timestamps are not 0 (assuming 0 means unset/default)
        if (
          Number(props.rowData.createRoleAfter) !== 0 &&
          Number(props.rowData.createRoleBefore) !== 0
        ) {
          enableRoleCreateTimeRange.value = true;
        }
      }

      if (model.value.goodsJson) {
        try {
          const goodsData = JSON.parse(model.value.goodsJson);

          const itemIds = goodsData.item_ids || [];
          const itemCounts = goodsData.item_counts || [];

          selectedItems.value = itemIds.map((id: number, index: number) => {
            let itemInfo = {
              name: String(id),
              names: "",
            };

            if (itemData.value?.data?.item) {
              const item = itemData.value.data.item[id];
              if (item) {
                itemInfo = {
                  name: item.name || String(id),
                  names: item.names || "",
                };
              }
            }

            return {
              id: String(id),
              name: itemInfo.name,
              names: itemInfo.names,
              count: itemCounts[index] || 1,
            };
          });
        } catch (e) {
          selectedItems.value = [];
        }
      }

      // 设置正确的时间选项和相应的时间单位
      if (data.mailExpire) {
        const mailExpireTime = Number(data.mailExpire);

        // 根据秒数匹配预设时间选项
        if (mailExpireTime === 24 * 60 * 60) {
          // 1天
          selectedTimeOption.value = "day_1";
          relativeTime.value = {
            years: 0,
            months: 0,
            days: 1,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else if (mailExpireTime === 3 * 24 * 60 * 60) {
          // 3天
          selectedTimeOption.value = "day_3";
          relativeTime.value = {
            years: 0,
            months: 0,
            days: 3,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else if (mailExpireTime === 7 * 24 * 60 * 60) {
          // 7天
          selectedTimeOption.value = "day_7";
          relativeTime.value = {
            years: 0,
            months: 0,
            days: 7,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else if (mailExpireTime === 15 * 24 * 60 * 60) {
          // 15天
          selectedTimeOption.value = "day_15";
          relativeTime.value = {
            years: 0,
            months: 0,
            days: 15,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else if (mailExpireTime === 30 * 24 * 60 * 60) {
          // 30天
          selectedTimeOption.value = "day_30";
          relativeTime.value = {
            years: 0,
            months: 0,
            days: 30,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else if (mailExpireTime === 90 * 24 * 60 * 60) {
          // 3个月
          selectedTimeOption.value = "month_3";
          relativeTime.value = {
            years: 0,
            months: 3,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else {
          // 自定义时间
          selectedTimeOption.value = "custom";

          // 计算各个时间单位
          const days = Math.floor(mailExpireTime / (24 * 60 * 60));
          const remainingSeconds = mailExpireTime % (24 * 60 * 60);
          const hours = Math.floor(remainingSeconds / (60 * 60));
          const remainingMinutes = remainingSeconds % (60 * 60);
          const minutes = Math.floor(remainingMinutes / 60);
          const seconds = remainingMinutes % 60;

          // 设置自定义时间值
          if (days >= 30) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            relativeTime.value = {
              years: 0,
              months: months,
              days: remainingDays,
              hours: hours,
              minutes: minutes,
              seconds: seconds,
            };
          } else {
            relativeTime.value = {
              years: 0,
              months: 0,
              days: days,
              hours: hours,
              minutes: minutes,
              seconds: seconds,
            };
          }
        }
      } else {
        // 默认选择1天
        selectedTimeOption.value = "day_1";
        relativeTime.value = {
          years: 0,
          months: 0,
          days: 1,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }
      applyRelativeTime();
    }
  },
  { immediate: true }
);

const themeStore = useThemeStore();

// 计算最终只读模式
const readonlyMode = computed(() => {
  if (typeof props.readonly === "boolean") return props.readonly;
  return (
    props.rowData?.isReadonly ||
    props.rowData?.mailStatus === 1 ||
    props.rowData?.mailStatus === 2 ||
    props.rowData?.mailStatus === 3 ||
    props.rowData?.mailStatus === 4
  );
});
</script>


<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-600px pr-20px">
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
            :label="$t('page.manage.operateserver.mailRemark')"
            path="mailRemark"
          >
            <NInput
              v-model:value="model.mailRemark"
              :placeholder="$t('page.manage.operateserver.form.mailRemark')"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.mailId')"
            path="mailId"
          >
            <NSelect
              v-model:value="model.mailId"
              :options="mailTemplateOptions"
              :placeholder="$t('page.manage.operateserver.form.mailId')"
              clearable
              @update:value="handleTemplateChange"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.operateserver.mailTitle')"
            path="mailTitle"
          >
            <NInput
              v-model:value="model.mailTitle"
              :placeholder="$t('page.manage.operateserver.form.mailTitle')"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24"
            :label="$t('page.manage.operateserver.mailContent')"
            path="mailContent"
          >
            <NInput
              v-model:value="model.mailContent"
              type="textarea"
              :placeholder="$t('page.manage.operateserver.form.mailContent')"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.operateserver.mailServerJson')"
            path="mailServerJson"
          >
            <NTreeSelect
              v-model:value="selectedServerIds"
              :options="serverTreeOptions"
              :placeholder="$t('page.manage.operateserver.form.mailServerJson')"
              multiple
              cascade
              checkable
              clearable
              :check-strategy="'child'"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.mailSendDate')"
          >
            <NDatePicker
              v-model:value="mailSendDateTimestamp"
              type="datetime"
              :placeholder="$t('page.manage.operateserver.form.mailSendDate')"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.mailExpire')"
          >
            <NSelect
              v-model:value="selectedTimeOption"
              :options="timeOptions"
              placeholder="请选择有效期限"
              @update:value="handleTimeOptionChange"
              clearable
              filterable
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <!-- 添加新的一行展示自定义时长输入框 -->
          <NFormItemGi
            span="24"
            :label="$t('page.manage.operateserver.custom')"
          >
            <div
              class="grid grid-cols-6 gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2"
              :class="{ 'opacity-50': selectedTimeOption !== 'custom' }"
              :disabled="readonlyMode"
            >
              <div>
                <NInputNumber
                  v-model:value="relativeTime.years"
                  :min="0"
                  :max="100"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>年</template>
                </NInputNumber>
              </div>

              <div>
                <NInputNumber
                  v-model:value="relativeTime.months"
                  :min="0"
                  :max="11"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>月</template>
                </NInputNumber>
              </div>

              <div>
                <NInputNumber
                  v-model:value="relativeTime.days"
                  :min="0"
                  :max="30"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>天</template>
                </NInputNumber>
              </div>

              <div>
                <NInputNumber
                  v-model:value="relativeTime.hours"
                  :min="0"
                  :max="23"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>时</template>
                </NInputNumber>
              </div>

              <div>
                <NInputNumber
                  v-model:value="relativeTime.minutes"
                  :min="0"
                  :max="59"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>分</template>
                </NInputNumber>
              </div>

              <div>
                <NInputNumber
                  v-model:value="relativeTime.seconds"
                  :min="0"
                  :max="59"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                >
                  <template #suffix>秒</template>
                </NInputNumber>
              </div>
            </div>
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.operateserver.enableDateRange')"
          >
            <NSwitch v-model:value="enableDateRange" />
          </NFormItemGi> -->

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.activeFrom')"
          >
            <NDatePicker
              v-model:value="createDateTimestamp"
              type="datetime"
              :placeholder="$t('page.manage.operateserver.form.activeFrom')"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.activeTo')"
          >
            <NDatePicker
              v-model:value="updateDateTimestamp"
              type="datetime"
              :placeholder="$t('page.manage.operateserver.form.activeTo')"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.operateserver.enableRoleCreateTimeRange')"
          >
            <NSwitch v-model:value="enableRoleCreateTimeRange" />
          </NFormItemGi> -->

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.createRoleAfter')"
          >
            <NDatePicker
              v-model:value="createRoleAfterTimestamp"
              type="datetime"
              :placeholder="
                $t('page.manage.operateserver.form.createRoleAfter')
              "
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.createRoleBefore')"
          >
            <NDatePicker
              v-model:value="createRoleBeforeTimestamp"
              type="datetime"
              :placeholder="
                $t('page.manage.operateserver.form.createRoleBefore')
              "
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.goodsJson')"
            path="goodsJson"
          >
            <NInput
              v-model:value="goodsSearchValue"
              :placeholder="$t('page.manage.operateserver.form.goodsJson')"
              @input="handleSearch"
              style="width: 100%"
              :disabled="readonlyMode"
            />
            <div
              v-show="searchResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1 rounded z-50 max-h-[400px] overflow-y-auto shadow-sm w-full"
              :class="[
                themeStore.darkMode
                  ? 'bg-[rgb(44,44,50)] border border-[#333]'
                  : 'bg-white border border-[#e5e7eb]',
              ]"
            >
              <div
                v-for="item in searchResults"
                :key="item.id"
                class="p-3 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                :class="[
                  themeStore.darkMode
                    ? 'hover:bg-[rgb(55,55,60)] border-[#333]'
                    : 'hover:bg-[#f3f4f6] border-[#e5e7eb]',
                ]"
                @click="addItem(item)"
                :disabled="readonlyMode"
              >
                <div
                  class="font-medium text-sm whitespace-normal break-words"
                  :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'"
                >
                  {{ item.names || item.name }}
                </div>
                <div
                  class="text-xs mt-1"
                  :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'"
                >
                  ID: {{ item.id }}
                </div>
              </div>
            </div>
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24"
            :label="$t('page.manage.operateserver.goods')"
            path="goodsJson"
          >
            <div class="space-y-4">
              <div v-if="selectedItems.length > 0" class="space-y-2">
                <NCard
                  v-for="item in selectedItems"
                  :key="item.id"
                  :class="[
                    '!shadow-sm',
                    themeStore.darkMode
                      ? '!border-[#333] !bg-[rgb(44,44,50)]'
                      : '!border-[#e5e7eb] !bg-[#f9fafb]'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div class="font-medium text-sm" :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'">{{ item.names }}</div>
                      <div class="text-xs" :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'">ID: {{ item.id }}</div>
                    </div>
                    <NTooltip :show-arrow="false">
                      <template #trigger>
                        <NInputNumber
                          v-model:value="item.count"
                          :min="1"
                          :max="99999999999"
                          class="!w-20"
                          size="small"
                        />
                      </template>
                      数量: {{ item.count?.toLocaleString() || 0 }}
                    </NTooltip>
                    <div
                      class="flex items-center justify-center cursor-pointer w-12 text-center"
                      @click="removeItem(item.id)"
                    >
                      <SvgIcon icon="mdi:delete" class="text-4 text-red-500 hover:text-red-600" />
                    </div>
                  </div>
                </NCard>
              </div>
            </div>
          </NFormItemGi> -->

          <NFormItemGi
            span="24"
            :label="$t('page.manage.mailGuildController.goods')"
            path="goodsJson"
          >
            <div class="space-y-4">
              <!-- 已选择的物品 -->
              <div v-if="selectedItems.length > 0" class="space-y-2">
                <NCard
                  v-for="item in selectedItems"
                  :key="item.id"
                  :class="[
                    '!shadow-sm',
                    themeStore.darkMode
                      ? '!border-[#333] !bg-[rgb(44,44,50)]'
                      : '!border-[#e5e7eb] !bg-[#f9fafb]',
                  ]"
                  style="width: 265px"
                  :disabled="readonlyMode"
                >
                  <div class="flex flex-col gap-2">
                    <div
                      class="font-medium text-sm"
                      :class="
                        themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'
                      "
                    >
                      {{ item.names }}
                    </div>
                    <div class="flex items-center gap-2">
                      <div
                        class="text-xs flex-1"
                        :class="
                          themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'
                        "
                      >
                        ID: {{ item.id }}
                      </div>
                      <NTooltip :show-arrow="false">
                        <template #trigger>
                          <NInputNumber
                            v-model:value="item.count"
                            :min="1"
                            :max="99999999999"
                            class="!w-20"
                            size="small"
                          />
                        </template>
                        数量: {{ item.count?.toLocaleString() || 0 }}
                      </NTooltip>
                      <div
                        class="flex items-center justify-center cursor-pointer w-12 text-center -mt-6"
                        @click="removeItem(item.id)"
                      >
                        <!-- <span class="text-3 text-red-500 hover:text-red-600">
                          {{
                          $t("common.cancel")
                        }}</span> -->
                        <SvgIcon
                          icon="mdi:delete"
                          class="text-4 text-red-500 hover:text-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </NCard>
              </div>
            </div>
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
          :disabled="readonlyMode"
          >{{ $t("common.confirm") }}</NButton
        >
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.n-input--disabled {
  cursor: not-allowed;
}
</style>
