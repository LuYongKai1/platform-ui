<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import { useItemPackage } from '@/hooks/business/useItemPackage';
import {
  fetchGetChannelList,
  fetchAddMultiMail,
  fetchUpdateMultiMail,
  fetchGetMailTemplateList,
  fetchmultiplerole,
  fetchAndStoreCsPackageData,
  fetchGetPackageVersion
} from "@/service/api";
import { $t } from "@/locales";
import {
  getJsonData,
  safeJsonParse,
  storeJsonData,
} from "@/utils/indexedDB";
import { useThemeStore } from "@/store/modules/theme";
import SvgIcon from "@/components/custom/svg-icon.vue";
import JSONbig from 'json-bigint';

const themeStore = useThemeStore();

// 公共的角色数据解析函数
function parseRolesData(mailRolesJson: any): any[] {
  try {
    let roles;
    if (typeof mailRolesJson === "object" && mailRolesJson !== null) {
      roles = mailRolesJson;
    } else if (typeof mailRolesJson === "string") {
      try {
        // 使用JSONbig来解析，保持大整数为字符串
        roles = JSONbig({ storeAsString: true }).parse(mailRolesJson);
      } catch (parseError) {
        try {
          // 如果是双重JSON编码，先用普通JSON解析一次
          const firstParse = JSON.parse(mailRolesJson);
          if (typeof firstParse === 'string') {
            roles = JSONbig({ storeAsString: true }).parse(firstParse);
          } else {
            roles = firstParse;
          }
        } catch (secondError) {
          // 最后尝试普通JSON解析
          roles = JSON.parse(mailRolesJson);
        }
      }
    }

    if (Array.isArray(roles)) {
      return roles.map((role: any) => ({
        id: String(role.roleId || role.id || role.openId),
        name: role.roleName || role.name || "未知角色",
        serverId: role.serverId || 1,
        serverName: role.serverName || "",
      }));
    }
    return [];
  } catch (e) {
    console.error("解析角色数据失败:", e);
    return [];
  }
}

function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: number | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

defineOptions({
  name: "ItemOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?:
    | (Api.SystemManage.operateMulti & {
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
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.operateserver.addservermail"),
    edit: $t("page.manage.operateserver.editservermail"),
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.operateMulti,
  | "mailRemark"
  | "mailId"
  | "mailTitle"
  | "mailExpire"
  | "mailContent"
  | "mailSendDate"
  | "mailRolesJson"
  | "goodsJson"
>;

const model = ref(createDefaultModel());

function convertToTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  if (dateStr.includes("+")) {
    return null;
  }
  try {
    // 将时间字符串解析为本地时间
    const [datePart, timePart] = dateStr.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute, second);
    // 返回秒级时间戳
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
    mailRolesJson: "",
    goodsJson: "",
  };
}

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
// --- End Helper Functions ---

// 相对时间设置
const relativeTime = ref({
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

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
const selectedTimeOption = ref<any>("day_1");

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
  seconds += (relativeTime.value.months || 0) * 30 * 24 * 60 * 60; // 简化计算，以每月 30 天计
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

// 应用相对时间
function applyRelativeTime() {
  const now = new Date();

  // 添加各个时间单位
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

// 定义邮件模板选项的类型
interface MailTemplateOption extends CommonType.Option<string> {
  template: {
    title: string;
    content: string;
  };
}
// 定义邮件模板接口
interface MailTemplateItem {
  mail_id: number;
  title_str: string;
  name_str: string;
  description_str: string;
}
// 定义邮件模板API响应类型
interface MailTemplateResponse {
  mails: MailTemplateItem[];
  // 可能还有其他字段
}

const mailTemplateOptions = ref<MailTemplateOption[]>([]);
const selectedServerIds = ref<string[]>([]);
const isTemplateSelected = computed(
  () => !!model.value.mailId && model.value.mailId !== "8888"
);

// 修改获取邮件模板列表的函数
async function getMailTemplateOptions() {
  const data = await fetchGetMailTemplateList();
  // 添加类型断言或检查
  const responseData = data?.response?.data as { mails?: unknown };
  if (responseData && responseData.mails && Array.isArray(responseData.mails)) {
    const templateResponse = responseData as unknown as MailTemplateResponse;
    mailTemplateOptions.value = templateResponse.mails.map((item) => ({
      label: `${item.title_str} (${item.name_str})`,
      value: String(item.mail_id),
      template: {
        title: item.title_str,
        content: item.description_str,
      },
    }));

    // 添加自定义模板选项
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
      // 自定义模板下，只有在新增模式时才清空标题和内容
      if (props.operateType === "add") {
        model.value.mailTitle = "";
        model.value.mailContent = "";
      }
    } else {
      // 选择了非自定义模板，总是使用模板内容
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
  (newVal, oldVal) => {
    // 只有在以下情况才应用模板内容：
    // 1. 从自定义模板切换到其他模板
    // 2. 模板变更（且不是切换到自定义模板）
    if (
      newVal &&
      newVal !== "8888" &&
      (oldVal === "8888" || (oldVal && oldVal !== newVal))
    ) {
      handleTemplateChange(newVal);
    } else if (newVal === "8888" && props.operateType === "add") {
      // 在添加模式下，切换到自定义模板时清空内容
      model.value.mailTitle = "";
      model.value.mailContent = "";
    } else if (!newVal) {
      // 清空选择时同样清空内容
      model.value.mailTitle = "";
      model.value.mailContent = "";
    }

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

    // 直接使用计算好的秒数
    const expireSeconds = mailExpireSeconds.value;

    const data = {
      id: props.rowData?.id,
      mailRemark: model.value.mailRemark,
      mailId: model.value.mailId,
      mailTitle: model.value.mailTitle,
      mailExpire: expireSeconds, // 直接使用计算好的秒数
      mailContent: model.value.mailContent,
      mailSendDate: model.value.mailSendDate,
      goodsJson: model.value.goodsJson,
      mailRolesJson: model.value.mailRolesJson || "[]",
      item_ids: itemIds,
      item_counts: itemCounts,
      mailType: 2,
      gameId: 101,
    };

    if (props.operateType === "add") {
      await fetchAddMultiMail(data);
      window.$message?.success($t("common.addSuccess"));
    } else {
      await fetchUpdateMultiMail(data);
      window.$message?.success($t("common.updateSuccess"));
    }
    closeDrawer();
    emit("submitted");
  } catch (error) {
    // 表单验证错误不显示错误消息
    if (error instanceof Error && error.message.includes("validation")) {
      return;
    }
    window.$message?.error($t("common.requestFailed"));
  }
}

const goodsSearchValue = ref("");
const searchResults = ref<{ id: string; name: string; names: string }[]>([]);
const selectedItems = ref<{ id: string; names: string; count: number }[]>([]);

const itemData = ref<any>(null);

// 使用 onMounted 来异步获取数据，避免 setup 函数返回 Promise
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

// 使用防抖包装物品搜索方法
const debouncedHandleSearch = useDebounce(handleSearch, 500);

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

// 在组件挂载时获取物品数据
// onMounted(() => {
//   fetchItemData();
// });

watch(visible, (newVal) => {
  if (newVal) {
    restoreValidation();
    getMailTemplateOptions();
    // fetchItemData();

    // 清空搜索相关的状态
    goodsSearchValue.value = "";
    searchResults.value = [];
    roleSearchValue.value = "";
    roleSearchResults.value = [];

    // 使用新增的帮助函数
    const currentTime = getCurrentFormattedTime();
    const oneMonthLaterTime = getOneMonthLaterFormattedTime();

    if (props.operateType === "edit" && props.rowData) {
      const data = props.rowData;
      const mailRolesJson = data.mailRolesJson || "[]";

      selectedRoles.value = parseRolesData(mailRolesJson);

      // 先保存mailId值，以便后续设置正确的标题和内容状态
      const mailId = String(data.mailId || "8888");

      model.value = {
        mailRemark: data.mailRemark || "",
        mailId: mailId,
        mailTitle: data.mailTitle || "",
        mailExpire: data.mailExpire
          ? convertToString(Number(data.mailExpire))
          : currentTime,
        mailContent: data.mailContent || "",
        mailSendDate: data.mailSendDate || currentTime,
        goodsJson: data.goodsJson || '{"item_ids":[],"item_counts":[]}',
        mailRolesJson: data.mailRolesJson || "[]",
      };

      // 处理物品数据 - Updated logic to match mail-operate-drawer.vue
      if (model.value.goodsJson) {
        try {
          const goodsData = JSON.parse(model.value.goodsJson);
          const itemIds = goodsData.item_ids || [];
          const itemCounts = goodsData.item_counts || [];

          selectedItems.value = itemIds.map((id: number, index: number) => {
            let itemInfo = {
              name: String(id), // Default name is the ID
              names: "", // Default names is empty string
            };

            if (itemData.value?.data?.item) {
              // Check if itemData is loaded
              const item = itemData.value.data.item[id]; // Get item details from itemData
              if (item) {
                itemInfo = {
                  name: item.name || String(id), // Use fetched name or default to ID
                  names: item.names || "", // Use fetched names or default to empty string
                };
              }
            }

            return {
              id: String(id),
              name: itemInfo.name, // Added name property
              names: itemInfo.names,
              count: itemCounts[index] || 1, // Use count from goodsData or default to 1
            };
          });
        } catch (e) {
          selectedItems.value = []; // Reset on error
        }
      } else {
        selectedItems.value = [];
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
          selectedTimeOption.value = "custom";

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
    } else {
      model.value = {
        ...createDefaultModel(),
        mailExpire: oneMonthLaterTime,
        mailSendDate: currentTime,
      };
      selectedItems.value = [];
      selectedServerIds.value = [];
      selectedRoles.value = [];

      selectedTimeOption.value = "day_1";
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
  }
});

watch(
  () => props.rowData,
  async (newVal) => {
    if (visible.value && props.operateType === "edit" && newVal) {
      if (mailTemplateOptions.value.length === 0) {
        await getMailTemplateOptions();
      }

      const data = newVal;

      const mailExpireDate = data.mailExpire
        ? convertToString(Number(data.mailExpire))
        : "";
      const mailSendDate = data.mailSendDate || "";

      const mailId = String(data.mailId || "8888");

      model.value = {
        mailRemark: data.mailRemark || "",
        mailId: mailId,
        mailTitle: data.mailTitle || "",
        mailExpire: mailExpireDate,
        mailSendDate: mailSendDate,
        mailContent: data.mailContent || "",
        goodsJson: data.goodsJson || '{"item_ids":[],"item_counts":[]}',
        mailRolesJson: data.mailRolesJson || "[]",
      };

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
      } else {
        selectedItems.value = [];
      }

      // 处理角色数据
      const mailRolesJson = data.mailRolesJson || "[]";
      selectedRoles.value = parseRolesData(mailRolesJson);

      if (data.mailExpire) {
        const mailExpireTime = Number(data.mailExpire);

        if (mailExpireTime === 24 * 60 * 60) {
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
          selectedTimeOption.value = "custom";

          const days = Math.floor(mailExpireTime / (24 * 60 * 60));
          const remainingSeconds = mailExpireTime % (24 * 60 * 60);
          const hours = Math.floor(remainingSeconds / (60 * 60));
          const remainingMinutes = remainingSeconds % (60 * 60);
          const minutes = Math.floor(remainingMinutes / 60);
          const seconds = remainingMinutes % 60;

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
const roleSearchValue = ref("");
const roleSearchResults = ref<
  { id: string; name: string; serverId: number; serverName?: string }[]
>([]);
const selectedRoles = ref<
  { id: string; name: string; serverId: number; serverName?: string }[]
>([]);

async function handleRoleSearch(value: string) {
  if (!value) {
    roleSearchResults.value = [];
    return;
  }

  try {
    const response = await fetchmultiplerole({
      param: value,
      type: "1",
    });
    if (response?.response?.data) {
      const data = Array.isArray(response.response.data)
        ? response.response.data
        : [response.response.data];
      roleSearchResults.value = data.map((role: any) => ({
        id: String(role.roleId || role.id),
        name: role.roleName || role.name || "未知角色",
        serverId: role.serverId || 1,
        serverName: role.serverName || "",
      }));
    }
  } catch (error) {
    console.error("搜索角色失败:", error);
    roleSearchResults.value = [];
  }
}

const debouncedHandleRoleSearch = useDebounce(handleRoleSearch, 500);

function addRole(role: {
  id: string;
  name: string;
  serverId?: number;
  serverName?: string;
}) {
  if (
    !selectedRoles.value.find((r) => r.id === role.id && r.name === role.name)
  ) {
    const roleToAdd = {
      ...role,
      serverId: role.serverId ?? 1,
      serverName: role.serverName ?? "",
    };
    selectedRoles.value = [...selectedRoles.value, roleToAdd];
  }
  roleSearchResults.value = [];
  roleSearchValue.value = "";
  updateMailRolesJson();
}

function removeRole(roleId: string) {
  selectedRoles.value = selectedRoles.value.filter((r) => r.id !== roleId);
  updateMailRolesJson();
}

function updateMailRolesJson() {
  const rolesData = selectedRoles.value.map((role) => ({
    openId: role.id,
    serverId: role.serverId || 1,
    roleId: role.id,
    roleName: role.name,
    serverName: role.serverName || "",
  }));
  model.value.mailRolesJson = JSON.stringify(rolesData);
}

const rules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
  mailRemark: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailTitle: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailContent: { ...defaultRequiredRule, trigger: ["input", "blur"] },
  mailId: { ...defaultRequiredRule, trigger: ["change", "blur"] },
  mailExpire: { ...defaultRequiredRule, trigger: ["change", "blur"] },
  mailSendDate: { ...defaultRequiredRule, trigger: ["change", "blur"] },
};

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
    <NScrollbar class="h-500px pr-20px">
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
              :disabled="isTemplateSelected || readonlyMode"
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
              :disabled="isTemplateSelected || readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.mailSendDate')"
            path="mailSendDate"
          >
            <NDatePicker
              v-model:value="mailSendDateTimestamp"
              type="datetime"
              :placeholder="$t('page.manage.operateserver.form.mailSendDate')"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.mailExpire')"
            path="mailExpire"
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

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.goodsJson')"
            path="goodsJson"
          >
            <NInput
              v-model:value="goodsSearchValue"
              :placeholder="$t('page.manage.operateserver.form.goodsJson')"
              @input="debouncedHandleSearch"
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

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.userRole')"
            path="mailRolesJson"
          >
            <NInput
              v-model:value="roleSearchValue"
              :placeholder="$t('page.manage.operateserver.form.userRole')"
              @input="debouncedHandleRoleSearch"
              style="width: 100%"
              :disabled="readonlyMode"
            />
            <div
              v-show="roleSearchResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1 rounded z-50 max-h-[400px] overflow-y-auto shadow-sm w-full"
              :class="[
                themeStore.darkMode
                  ? 'bg-[rgb(44,44,50)] border border-[#333]'
                  : 'bg-white border border-[#e5e7eb]',
              ]"
            >
              <div
                v-for="role in roleSearchResults"
                :key="role.id + '-' + role.name"
                class="p-3 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                :class="[
                  themeStore.darkMode
                    ? 'hover:bg-[rgb(55,55,60)] border-[#333]'
                    : 'hover:bg-[#f3f4f6] border-[#e5e7eb]',
                ]"
                @click="addRole(role)"
                :disabled="readonlyMode"
              >
                <div
                  class="font-medium text-sm whitespace-normal break-words"
                  :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'"
                >
                  {{ role.name }}
                </div>
                <div
                  class="text-xs mt-1"
                  :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'"
                >
                  ID: {{ role.id }}
                </div>
                <div
                  v-if="role.serverName"
                  class="text-xs mt-1"
                  :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'"
                >
                  服务器: {{ role.serverName }}
                </div>
              </div>
            </div>
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24 m:12"
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
            span="24 m:12"
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
                            :disabled="readonlyMode"
                          />
                        </template>
                        数量: {{ item.count?.toLocaleString() || 0 }}
                      </NTooltip>
                      <div
                        class="flex items-center justify-center cursor-pointer w-12 text-center -mt-6"
                        @click="removeItem(item.id)"
                        :disabled="readonlyMode"
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

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.operateserver.role')"
            path="mailRolesJson"
          >
            <div class="space-y-4">
              <!-- 已选择的角色 -->
              <div v-if="selectedRoles.length > 0" class="space-y-2">
                <NCard
                  v-for="role in selectedRoles"
                  :key="role.id + '-' + role.name"
                  :class="[
                    '!shadow-sm',
                    themeStore.darkMode
                      ? '!border-[#333] !bg-[rgb(44,44,50)]'
                      : '!border-[#e5e7eb] !bg-[#f9fafb]',
                  ]"
                  style="width: 265px"
                  :disabled="readonlyMode"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div
                        class="font-medium text-sm"
                        :class="
                          themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'
                        "
                      >
                        {{ role.name }}
                      </div>
                      <div
                        class="text-xs"
                        :class="
                          themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'
                        "
                      >
                        ID: {{ role.id }}
                      </div>
                      <div
                        v-if="role.serverName"
                        class="text-xs mt-1"
                        :class="
                          themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'
                        "
                      >
                        服务器:{{ role.serverName }}
                      </div>
                    </div>
                    <div
                      class="flex items-center justify-center cursor-pointer w-12 text-center"
                      @click="removeRole(role.id)"
                      :disabled="readonlyMode"
                    >
                      <SvgIcon
                        icon="mdi:delete"
                        class="text-4 text-red-500 hover:text-red-600"
                      />
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

<style scoped></style>
