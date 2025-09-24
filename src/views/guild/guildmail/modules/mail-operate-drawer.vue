<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import type { Ref } from 'vue';
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import type { FormRules, FormItemRule, FormInst } from 'naive-ui';
import {
  fetchGetMailTemplateList,
  fetchAndStoreCsPackageData,
  fetchGetGuildList,
  fetchAddGuildMail,
  fetchUpdateGuildMail,
} from "@/service/api";
import { $t } from "@/locales";
import { useServerStore } from '@/store/modules/server';
import { useThemeStore } from '@/store/modules/theme';
import { useItemPackage } from '@/hooks/business/useItemPackage';

defineOptions({
  name: "MailOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: (Api.SystemManage.operateGuild & { mailStatus?: number, isReadonly?: boolean }) | null;
  /** mail status to determine read-only mode */
  mailStatus?: number;
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

// 表单验证规则
const rules: Record<string, FormRules | FormItemRule> = {
  mailRemark: { ...defaultRequiredRule, trigger: ['input', 'blur'] },
  mailId: { ...defaultRequiredRule, trigger: ['change', 'blur'] },
  mailTitle: { ...defaultRequiredRule, trigger: ['input', 'blur'] },
  mailContent: { ...defaultRequiredRule, trigger: ['input', 'blur'] },
  serverId: {
    required: true,
    message: $t('page.manage.mailGuildController.form.mailServerJson'),
    trigger: ['change', 'blur'],
    validator: (rule: FormItemRule, value: string) => {
      try {
        return selectedServerId.value.length > 0;
      } catch {
        return false;
      }
    }
  },
};

// 判断是否为只读模式（邮件已发送）
const readonlyMode = computed(() => {
  // 优先外部传入
  if (typeof props.readonly === 'boolean') return props.readonly;
  // 兼容旧逻辑
  return props.rowData?.isReadonly || props.rowData?.mailStatus === 1 ||
         props.rowData?.mailStatus === 2 ||
         props.rowData?.mailStatus === 3 ||
         props.rowData?.mailStatus === 4;
});

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.mailGuildController.addservermail"),
    edit: $t("page.manage.mailGuildController.editservermail"),
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.operateGuild,
  | "mailRemark"
  | "mailId"
  | "mailTitle"
  | "mailExpire"
  | "mailContent"
  | "mailSendDate"
  | "serverId"
  | "goodsJson"
  | "mailGuildJson"
>;

const model = ref(createDefaultModel());

// 时间格式化辅助函数
function getCurrentFormattedTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getOneMonthLaterFormattedTime(): string {
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function convertToString(timestamp: number | null): string {
  if (!timestamp) return '';
  try {
    const milliseconds = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return '';
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
    serverId: "",
    goodsJson: "",
    mailGuildJson: "",
  };
}

// 相对时间设置
const relativeTime = ref({
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

// 有效期限选项
const timeOptions = [
  { label: '自定义时长', value: 'custom' },
  { label: '1 天', value: 'day_1' },
  { label: '3 天', value: 'day_3' },
  { label: '7 天', value: 'day_7' },
  { label: '15 天', value: 'day_15' },
  { label: '30 天', value: 'day_30' },
  { label: '3 个月', value: 'month_3' },
];

const selectedTimeOption = ref<any>(null);

// 处理预设时间选项变更
function handleTimeOptionChange(option: any) {
  if (option === 'custom') {
    return;
  }

  // 重置所有时间单位
  relativeTime.value = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  // 根据选项设置相应的时间
  if (option === 'day_1') {
    relativeTime.value.days = 1;
  } else if (option === 'day_3') {
    relativeTime.value.days = 3;
  } else if (option === 'day_7') {
    relativeTime.value.days = 7;
  } else if (option === 'day_15') {
    relativeTime.value.days = 15;
  } else if (option === 'day_30') {
    relativeTime.value.days = 30;
  } else if (option === 'month_3') {
    relativeTime.value.months = 3;
  }
}

// 计算总秒数
const totalSeconds = computed(() => {
  let seconds = 0;
  seconds += (relativeTime.value.years || 0) * 365 * 24 * 60 * 60;
  seconds += (relativeTime.value.months || 0) * 30 * 24 * 60 * 60;
  seconds += (relativeTime.value.days || 0) * 24 * 60 * 60;
  seconds += (relativeTime.value.hours || 0) * 60 * 60;
  seconds += (relativeTime.value.minutes || 0) * 60;
  seconds += (relativeTime.value.seconds || 0);
  return seconds;
});

// 计算过期时间秒数
const mailExpireSeconds = computed(() => {
  if (selectedTimeOption.value === 'day_1') {
    return 1 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'day_3') {
    return 3 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'day_7') {
    return 7 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'day_15') {
    return 15 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'day_30') {
    return 30 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'month_3') {
    return 90 * 24 * 60 * 60;
  } else if (selectedTimeOption.value === 'custom') {
    return totalSeconds.value;
  }
  return 0;
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
      model.value.mailSendDate = '';
    } else {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      model.value.mailSendDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }
});

// 邮件模板相关
interface MailTemplateOption extends CommonType.Option<string> {
  template: {
    title: string;
    content: string;
  };
}
const mailTemplateOptions = ref<MailTemplateOption[]>([]);

const serverStore = useServerStore();

function disableGroupSelect(options: any[]): any[] {
  return options.map(option => {
    if (option.children && option.children.length > 0) {
      return {
        ...option,
        children: disableGroupSelect(option.children)
      };
    }
    return option;
  });
}

const serverTreeOptions = computed(() => {
  return disableGroupSelect(serverStore.serverTreeOptions);
});


const selectedServerId = ref<string>('');

// 监听 serverId 的变化
watch(() => model.value.serverId, (newVal) => {
  try {
    const ids = JSON.parse(newVal);
    selectedServerId.value = Array.isArray(ids) && ids.length > 0 ? String(ids[0]) : '';
  } catch {
    selectedServerId.value = '';
  }
}, { immediate: true });

// 监听 selectedServerId 的变化
watch(selectedServerId, (val) => {
  if (val && !String(val).startsWith('region_')) {
    model.value.serverId = JSON.stringify([val]);
  } else {
    model.value.serverId = JSON.stringify([]);
    // 清空公会搜索相关状态
    guildSearchValue.value = '';
    guildSearchResults.value = [];
    selectedGuilds.value = [];
  }
});

const isTemplateSelected = computed(() => !!model.value.mailId && model.value.mailId !== "8888");

async function getMailTemplateOptions() {
  const data = await fetchGetMailTemplateList();
  const responseData = data?.response?.data as { mails?: any[] };
  if (responseData && responseData.mails) {
    mailTemplateOptions.value = responseData.mails.map((item: any) => ({
      label: `${item.title_str} (${item.name_str})`,
      value: String(item.mail_id),
      template: {
        title: item.title_str,
        content: item.description_str
      }
    }));

    mailTemplateOptions.value.unshift({
      label: "自定义模板",
      value: "8888",
      template: {
        title: "",
        content: ""
      }
    });
  }
}

// 邮件模板选择处理
function handleTemplateChange(mailId: string | null) {
  if (mailId) {
    if (mailId === "8888") {
      model.value.mailTitle = '';
      model.value.mailContent = '';
    } else {
      const selectedTemplate = mailTemplateOptions.value.find(
        option => option.value === mailId
      );
      if (selectedTemplate) {
        model.value.mailTitle = selectedTemplate.template.title;
        model.value.mailContent = selectedTemplate.template.content;
      }
    }
  } else {
    model.value.mailTitle = '';
    model.value.mailContent = '';
  }
}

// 监听mailId的变化
watch(() => model.value.mailId, (newVal) => {
  handleTemplateChange(newVal);
  restoreValidation();
});

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  try {
    const itemIds: number[] = [];
    const itemCounts: number[] = [];

    if (selectedItems.value.length > 0) {
      selectedItems.value.forEach(item => {
        itemIds.push(Number(item.id));
        itemCounts.push(Number(item.count));
      });

      model.value.goodsJson = JSON.stringify({
        item_ids: itemIds,
        item_counts: itemCounts
      });
    } else {
      model.value.goodsJson = '{"item_ids": [], "item_counts": []}';
    }

    // 获取serverId
    let serverIdValue = "";
    if (model.value.serverId) {
      try {
        const serverIds = JSON.parse(model.value.serverId);
        serverIdValue = serverIds.length > 0 ? String(serverIds[0]) : "";
      } catch (e) {
        serverIdValue = "";
      }
    }

    const expireSeconds = mailExpireSeconds.value;

    // 更新公会数据
    updateMailGuildsJson();

    const data = {
      id: props.rowData?.id,
      mailRemark: model.value.mailRemark,
      mailId: model.value.mailId,
      mailTitle: model.value.mailTitle,
      mailExpire: expireSeconds,
      mailContent: model.value.mailContent,
      mailSendDate: model.value.mailSendDate,
      serverId: serverIdValue,
      goodsJson: model.value.goodsJson,
      mailGuildJson: model.value.mailGuildJson,
      mailType: 1,
      gameId: 101
    };

    if (props.operateType === "add") {
      await fetchAddGuildMail(data);
      window.$message?.success($t("common.addSuccess"));
      // 清空状态
      selectedItems.value = [];
      selectedServerId.value = '';
      guildSearchValue.value = '';
      guildSearchResults.value = [];
      selectedGuilds.value = [];
    } else {
      await fetchUpdateGuildMail(data);
      window.$message?.success($t("common.updateSuccess"));
    }
    closeDrawer();
    emit("submitted");
  } catch (error) {
    console.error('提交失败:', error);
  }
}

// 物品搜索相关
const goodsSearchValue = ref('');
const searchResults = ref<{ id: string; name: string; names: string }[]>([]);
const selectedItems = ref<{ id: string; names: string; count: number }[]>([]);
const itemData = ref<any>(null);

// 公会搜索相关
const guildSearchValue = ref("");
const guildSearchResults = ref<{ guid: string; guild_name: string; leader_name: string; member_count: number }[]>([]);
const selectedGuilds = ref<{ guid: string; guild_name: string; leader_name: string; member_count: number }[]>([]);

onMounted(async () => {
  try {
    const data = await useItemPackage();
    itemData.value = data;
  } catch (error) {
    console.error("获取物品数据失败:", error);
    itemData.value = null;
  }
});

// 物品搜索
function handleSearch(value: string) {
  if (!value) {
    searchResults.value = [];
    return;
  }

  const results: { id: string; name: string; names: string }[] = [];
  const searchValue = value.toLowerCase();

  if (itemData.value?.data?.item) {
    const items = itemData.value.data.item;
    Object.entries(items).forEach(([id, item]: [string, any]) => {
      const itemName = item.name || String(id);
      const itemNames = item.names || '';
      if (
        String(id).includes(searchValue) ||
        itemName.toLowerCase().includes(searchValue) ||
        itemNames.toLowerCase().includes(searchValue)
      ) {
        results.push({
          id: String(id),
          name: itemName,
          names: itemNames
        });
      }
    });
  }

  searchResults.value = results;
}

// 防抖函数
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: number | null = null;
  return function(...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

const debouncedHandleSearch = useDebounce(handleSearch, 500);

// 添加物品
function addItem(item: { id: string; name: string; names: string }) {
  const existingItem = selectedItems.value.find(i => i.id === item.id);
  if (!existingItem) {
    selectedItems.value.push({ ...item, count: 1 });
    updateGoodsJson();
  }
  searchResults.value = [];
  goodsSearchValue.value = '';
}

function removeItem(itemId: string) {
  selectedItems.value = selectedItems.value.filter(i => i.id !== itemId);
  updateGoodsJson();
}

function updateGoodsJson() {
  const itemIds = selectedItems.value.map(item => Number(item.id));
  const itemCounts = selectedItems.value.map(item => Number(item.count));

  model.value.goodsJson = JSON.stringify({
    item_ids: itemIds,
    item_counts: itemCounts
  });
}

// 公会搜索
async function handleGuildSearch(value: string) {
  if (!value || !selectedServerId.value || String(selectedServerId.value).startsWith('region_')) {
    guildSearchResults.value = [];
    return;
  }

  try {
    const response = await fetchGetGuildList({
      serverId: Number(selectedServerId.value),
      current: 1,
      size: 1000
    });

    const responseData = response?.response?.data as any;
    if (responseData && responseData.rows) {
      const searchValue = value.toLowerCase();
      const filteredGuilds = responseData.rows.filter((guild: any) => {
        const guildName = guild.guild_name || '';
        const guildId = String(guild.guid || '');
        const leaderName = guild.leader_name || '';

        return (
          guildId.includes(searchValue) ||
          guildName.toLowerCase().includes(searchValue) ||
          leaderName.toLowerCase().includes(searchValue)
        );
      });

      guildSearchResults.value = filteredGuilds.map((guild: any) => ({
        guid: String(guild.guid),
        guild_name: guild.guild_name,
        leader_name: guild.leader_name,
        member_count: guild.member_count
      }));
    } else {
      guildSearchResults.value = [];
    }
  } catch (error) {
    console.error("搜索公会失败:", error);
    guildSearchResults.value = [];
  }
}

const debouncedHandleGuildSearch = useDebounce(handleGuildSearch, 500);

// 添加公会
function addGuild(guild: { guid: string; guild_name: string; leader_name: string; member_count: number }) {
  if (!selectedGuilds.value.find((g) => g.guid === guild.guid)) {
    selectedGuilds.value = [...selectedGuilds.value, guild];
  }
  guildSearchResults.value = [];
  guildSearchValue.value = "";
  updateMailGuildsJson();
}

// 删除公会
function removeGuild(guildId: string) {
  selectedGuilds.value = selectedGuilds.value.filter((g) => g.guid !== guildId);
  updateMailGuildsJson();
}

// 更新mailGuildsJson
function updateMailGuildsJson() {
  const guildsData = selectedGuilds.value.map((guild) => ({
    guildId: guild.guid,
    guildName: guild.guild_name,
    serverId: Number(selectedServerId.value)
  }));
  model.value.mailGuildJson = JSON.stringify(guildsData);
}

// 主要的监听器 - 处理表单初始化
watch(visible, async (newVal) => {
  if (newVal) {
    restoreValidation();
    await getMailTemplateOptions();
    await serverStore.fetchServerList();
    // fetchItemData();

    // 清空搜索相关的状态
    goodsSearchValue.value = "";
    searchResults.value = [];
    guildSearchValue.value = "";
    guildSearchResults.value = [];

    const currentTime = getCurrentFormattedTime();
    const oneMonthLaterTime = getOneMonthLaterFormattedTime();

    if (props.operateType === 'edit' && props.rowData) {
      const data = props.rowData;
      let serverIds: string[] = [];

      // 处理serverId
      try {
        if (data.serverId) {
          if (typeof data.serverId === 'string') {
            try {
              const parsed = JSON.parse(data.serverId);
              if (Array.isArray(parsed)) {
                serverIds = parsed.map((item: any) => String(item.serverId || item));
              } else {
                serverIds = [String(parsed)];
              }
            } catch (parseError) {
              serverIds = [String(data.serverId)];
            }
          } else if (Array.isArray(data.serverId)) {
            serverIds = (data.serverId as any[]).map((item: any) => String(item.serverId || item));
          } else {
            serverIds = [String(data.serverId)];
          }
        }
      } catch (e) {
        console.error('解析serverId失败:', e);
      }

      model.value = {
        mailRemark: data.mailRemark || '',
        mailId: String(data.mailId || ''),
        mailTitle: data.mailTitle || '',
        mailExpire: data.mailExpire ? convertToString(Number(data.mailExpire)) : oneMonthLaterTime,
        mailContent: data.mailContent || '',
        mailSendDate: data.mailSendDate || currentTime,
        serverId: JSON.stringify(serverIds),
        goodsJson: data.goodsJson || '{"item_ids":[],"item_counts":[]}',
        mailGuildJson: data.mailGuildJson || "[]",
      };

      // 设置selectedServerId
      setTimeout(() => {
        if (serverIds.length > 0) {
          selectedServerId.value = serverIds[0];
        }
      }, 100);

      // 处理物品数据
      if (model.value.goodsJson) {
        try {
          const goodsData = JSON.parse(model.value.goodsJson);
          const itemIds = goodsData.item_ids || [];
          const itemCounts = goodsData.item_counts || [];

          selectedItems.value = itemIds.map((id: number, index: number) => {
            let itemInfo = {
              name: String(id),
              names: ''
            };

            if (itemData.value?.data?.item) {
              const item = itemData.value.data.item[id];
              if (item) {
                itemInfo = {
                  name: item.name || String(id),
                  names: item.names || ''
                };
              }
            }

            return {
              id: String(id),
              name: itemInfo.name,
              names: itemInfo.names,
              count: itemCounts[index] || 1
            };
          });
        } catch (e) {
          console.error('解析goodsJson失败:', e);
          selectedItems.value = [];
        }
      }

      // 处理公会数据
      if (data.mailGuildJson) {
        try {
          const guildData = JSON.parse(data.mailGuildJson);
          if (Array.isArray(guildData)) {
            selectedGuilds.value = guildData.map((guild: any) => ({
              guid: String(guild.guildId || guild.guid || ''),
              guild_name: guild.guildName || guild.guild_name || '',
              leader_name: guild.leader_name || '',
              member_count: guild.member_count || 0
            }));
          }
        } catch (e) {
          console.error('解析mailGuildJson失败:', e);
          selectedGuilds.value = [];
        }
      } else {
        selectedGuilds.value = [];
      }

      // 设置时间选项
      if (data.mailExpire) {
        const mailExpireTime = Number(data.mailExpire);
        if (mailExpireTime === 24 * 60 * 60) {
          selectedTimeOption.value = 'day_1';
          relativeTime.value = { years: 0, months: 0, days: 1, hours: 0, minutes: 0, seconds: 0 };
        } else if (mailExpireTime === 3 * 24 * 60 * 60) {
          selectedTimeOption.value = 'day_3';
          relativeTime.value = { years: 0, months: 0, days: 3, hours: 0, minutes: 0, seconds: 0 };
        } else if (mailExpireTime === 7 * 24 * 60 * 60) {
          selectedTimeOption.value = 'day_7';
          relativeTime.value = { years: 0, months: 0, days: 7, hours: 0, minutes: 0, seconds: 0 };
        } else if (mailExpireTime === 15 * 24 * 60 * 60) {
          selectedTimeOption.value = 'day_15';
          relativeTime.value = { years: 0, months: 0, days: 15, hours: 0, minutes: 0, seconds: 0 };
        } else if (mailExpireTime === 30 * 24 * 60 * 60) {
          selectedTimeOption.value = 'day_30';
          relativeTime.value = { years: 0, months: 0, days: 30, hours: 0, minutes: 0, seconds: 0 };
        } else if (mailExpireTime === 90 * 24 * 60 * 60) {
          selectedTimeOption.value = 'month_3';
          relativeTime.value = { years: 0, months: 3, days: 0, hours: 0, minutes: 0, seconds: 0 };
        } else {
          // 自定义时间
          selectedTimeOption.value = 'custom';
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
              seconds: seconds
            };
          } else {
            relativeTime.value = {
              years: 0,
              months: 0,
              days: days,
              hours: hours,
              minutes: minutes,
              seconds: seconds
            };
          }
        }
      } else {
        selectedTimeOption.value = 'day_1';
        relativeTime.value = { years: 0, months: 0, days: 1, hours: 0, minutes: 0, seconds: 0 };
      }
    } else {
      model.value = {
        ...createDefaultModel(),
        mailExpire: oneMonthLaterTime,
        mailSendDate: currentTime,
      };
      selectedItems.value = [];
      selectedServerId.value = '';
      guildSearchValue.value = '';
      guildSearchResults.value = [];
      selectedGuilds.value = [];

      // 默认选择1天
      selectedTimeOption.value = 'day_1';
      relativeTime.value = {
        years: 0,
        months: 0,
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }
  }
});

const themeStore = useThemeStore();
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
            :label="$t('page.manage.mailGuildController.mailRemark')"
            path="mailRemark"
          >
            <NInput
              v-model:value="model.mailRemark"
              :placeholder="$t('page.manage.mailGuildController.form.mailRemark')"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.mailId')"
            path="mailId"
          >
            <NSelect
              v-model:value="model.mailId"
              :options="mailTemplateOptions"
              :placeholder="$t('page.manage.mailGuildController.form.mailId')"
              clearable
              @update:value="handleTemplateChange"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.mailGuildController.mailTitle')"
            path="mailTitle"
          >
            <NInput
              v-model:value="model.mailTitle"
              :placeholder="$t('page.manage.mailGuildController.form.mailTitle')"
              :disabled="readonlyMode || isTemplateSelected"
            />
          </NFormItemGi>


          <NFormItemGi
            span="24"
            :label="$t('page.manage.mailGuildController.mailContent')"
            path="mailContent"
          >
            <NInput
              v-model:value="model.mailContent"
              type="textarea"
              :placeholder="$t('page.manage.mailGuildController.form.mailContent')"
              :disabled="readonlyMode || isTemplateSelected"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.mailGuildController.mailServerJson')"
            path="serverId"
          >
            <NTreeSelect
              v-model:value="selectedServerId"
              :options="serverTreeOptions"
              :placeholder="$t('page.manage.mailGuildController.form.mailServerJson')"
              clearable
              :disabled="readonlyMode"

            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.mailSendDate')"
          >
            <NDatePicker
              v-model:value="mailSendDateTimestamp"
              type="datetime"
              :placeholder="$t('page.manage.mailGuildController.form.mailSendDate')"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :disabled="readonlyMode"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.mailExpire')"
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
            :label="$t('page.manage.mailGuildController.custom')"
          >
            <div class="grid grid-cols-6 gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2" :class="{ 'opacity-50': selectedTimeOption !== 'custom' }">
              <div>
                <NInputNumber
                  v-model:value="relativeTime.years"
                  :min="0"
                  :max="100"
                  class="w-full"
                  :show-button="false"
                  size="small"
                  :disabled="selectedTimeOption !== 'custom' || readonlyMode"
                  placeholder="年"

                />
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
                  placeholder="月"
                />
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
                  placeholder="天"
                />
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
                  placeholder="时"
                />
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
                  placeholder="分"
                />
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
                  placeholder="秒"
                />
              </div>
            </div>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.goodsJson')"
            path="goodsJson"
          >
            <NInput
              v-model:value="goodsSearchValue"
              :placeholder="$t('page.manage.mailGuildController.form.goodsJson')"
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
                  : 'bg-white border border-[#e5e7eb]'
              ]"
            >
              <div
                v-for="item in searchResults"
                :key="item.id"
                class="p-3 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                :class="[
                  themeStore.darkMode
                    ? 'hover:bg-[rgb(55,55,60)] border-[#333]'
                    : 'hover:bg-[#f3f4f6] border-[#e5e7eb]'
                ]"
                @click="addItem(item)"
              >
                <div class="font-medium text-sm whitespace-normal break-words" :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'">{{ item.names || item.name }}</div>
                <div class="text-xs mt-1" :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'">ID: {{ item.id }}</div>
              </div>
            </div>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.mailGuildJson')"
          >
            <NInput
              v-model:value="guildSearchValue"
              :placeholder="$t('page.manage.mailGuildController.form.mailGuildJson')"
              @input="debouncedHandleGuildSearch"
              :disabled="!selectedServerId || String(selectedServerId).startsWith('region_') || readonlyMode"
              style="width: 100%"
            />
            <div
              v-show="guildSearchResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1 rounded z-50 max-h-[400px] overflow-y-auto shadow-sm w-full"
              :class="[
                themeStore.darkMode
                  ? 'bg-[rgb(44,44,50)] border border-[#333]'
                  : 'bg-white border border-[#e5e7eb]'
              ]"
            >
              <div
                v-for="guild in guildSearchResults"
                :key="guild.guid"
                class="p-3 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                :class="[
                  themeStore.darkMode
                    ? 'hover:bg-[rgb(55,55,60)] border-[#333]'
                    : 'hover:bg-[#f3f4f6] border-[#e5e7eb]'
                ]"
                @click="addGuild(guild)"
              >
                <div class="flex flex-col gap-2">
                  <div class="font-medium text-sm" :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'">{{ guild.guild_name }}</div>
                  <div class="flex items-center gap-2">
                    <div class="text-xs flex-1" :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'">ID: {{ guild.guid }}</div>
                    <div
                      class="flex items-center justify-center cursor-pointer w-12 text-center"
                      @click="removeGuild(guild.guid)"
                    >
                      <!-- <span class="text-3 text-red-500 hover:text-red-600">{{ $t("common.cancel") }}</span> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.goods')"
            path="goodsJson"
          >
            <div class="space-y-4 ">
              <!-- 已选择的物品 -->
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
                  style="width: 265px"
                >

                  <div class="flex flex-col gap-2">
                    <div class="font-medium text-sm" :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'">{{ item.names }}</div>
                    <div class="flex items-center gap-2">
                      <div class="text-xs flex-1" :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'">ID: {{ item.id }}</div>
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
                      >
                        <!-- <span class="text-3 text-red-500 hover:text-red-600">
                          {{
                          $t("common.cancel")
                        }}</span> -->
                        <SvgIcon icon="mdi:delete" class="text-4 text-red-500 hover:text-red-600" />
                      </div>
                    </div>
                  </div>
                </NCard>
              </div>
            </div>
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.mailGuildController.mailGuildJson')"
          >
            <div class="space-y-4 ">
              <!-- 已选择的公会 -->
              <div v-if="selectedGuilds.length > 0" class="space-y-2">
                <NCard
                  v-for="guild in selectedGuilds"
                  :key="guild.guid"
                  :class="[
                    '!shadow-sm',
                    themeStore.darkMode
                      ? '!border-[#333] !bg-[rgb(44,44,50)]'
                      : '!border-[#e5e7eb] !bg-[#f9fafb]'
                  ]"
                  style="width: 265px; height: 98px;"
                >
                  <div class="flex flex-col gap-2">
                    <div class="font-medium text-sm" :class="themeStore.darkMode ? 'text-white' : 'text-[#1f1f1f]'">{{ guild.guild_name }}</div>
                    <div class="flex items-center gap-2">
                      <div class="text-xs flex-1" :class="themeStore.darkMode ? 'text-[#aaa]' : 'text-[#666]'">ID: {{ guild.guid }}</div>
                      <div
                        class="flex items-center justify-center cursor-pointer w-12 text-center -mt-6"
                        @click="removeGuild(guild.guid)"
                      >
                        <!-- <span class="text-3 text-red-500 hover:text-red-600 -mt-6">{{ $t("common.cancel") }}</span> -->
                        <SvgIcon icon="mdi:delete" class="text-4 text-red-500 hover:text-red-600" />
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
        <NButton type="primary" @click="handleSubmit" :disabled="readonlyMode">{{
          $t("common.confirm")
        }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.n-input--disabled {
  cursor: not-allowed;
}
</style>

