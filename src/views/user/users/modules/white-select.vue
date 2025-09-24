<script setup lang="ts">
import { ref, watch, reactive, onMounted, onActivated } from "vue";
import { $t } from "@/locales";
import { fetchGetChannelList } from "@/service/api";
import type { SelectOption } from "naive-ui";

defineOptions({
  name: "whiteSelect",
});

// 定义 Props，接收父组件传递的 model
interface Props {
  model: {
    channelId?: string;
    userId?: string; // 用户ID，支持模糊搜索
    openId?: string; // 平台ID，支持模糊搜索
    ban?: boolean | null; // 封禁状态
    chat?: boolean | null; // 禁言状态
    [key: string]: any; // 添加索引签名
  };
}
const props = defineProps<Props>();

interface Emits {
  (e: "reset"): void;
  (e: "search"): void;
}
const emit = defineEmits<Emits>();

const localModel = reactive<Props["model"]>(
  props.model || {
    channelId: "",
    userId: "",
    openId: "",
    ban: null,
    chat: null,
  }
);

const maxUserIdLength = 18;
const maxOpenIdLength = 36;
let searchTimer: number | null = null;

// 验证数字输入
function validateNumberInput(value: string): boolean {
  return /^\d*$/.test(value);
}

// 处理用户ID输入
function handleUserIdInput(value: string) {
  if (validateNumberInput(value)) {
    if (value.length <= maxUserIdLength) {
      localModel.userId = value;
    }
  }
}

// 处理平台ID输入
function handleOpenIdInput(value: string) {
  if (validateNumberInput(value)) {
    if (value.length <= maxOpenIdLength) {
      localModel.openId = value;
    }
  }
}

const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = window.setTimeout(() => {
    emit("search");
    searchTimer = null;
  }, 300);
};

watch(
  () => props.model,
  (newModel) => {
    Object.assign(localModel, newModel);
  },
  { deep: true }
);

watch(
  () => localModel.userId,
  (newValue, oldValue) => {
    if (newValue && newValue.length > maxUserIdLength) {
      localModel.userId = newValue.slice(0, maxUserIdLength);
      return;
    }

    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.openId,
  (newValue, oldValue) => {
    if (newValue && newValue.length > maxOpenIdLength) {
      localModel.openId = newValue.slice(0, maxOpenIdLength);
      return;
    }

    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.channelId,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.ban,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.chat,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

const userStatus = ref("");

watch(userStatus, (newValue) => {
  if (newValue === "ban") {
    localModel.ban = true;
    localModel.chat = null;
  } else if (newValue === "chat") {
    localModel.ban = null;
    localModel.chat = true;
  } else if (newValue === "both") {
    localModel.ban = true;
    localModel.chat = true;
  } else {
    localModel.ban = null;
    localModel.chat = null;
  }
  debounceSearch();
});

const channeOptions = ref<CommonType.Option<string>[]>([]);
const loadingChannel = ref(false);

async function getChannelOptions() {
  loadingChannel.value = true;
  try {
    const { error, data } = await fetchGetChannelList();

    if (error) {
      console.error("Failed to fetch channels:", error);
      return;
    }

    const allOption: CommonType.Option<string> = { label: "全部", value: "" };

    const options = data.map((item: any) => ({
      label: item.channelName,
      value: item.channelId,
    }));

    channeOptions.value = [allOption, ...options];
  } catch (error) {
    console.error("Error fetching channel list:", error);
  } finally {
    loadingChannel.value = false;
  }
}

function clearSearchFields() {
  userStatus.value = "";
  localModel.userId = "";
  localModel.openId = "";
  localModel.channelId = "";
  localModel.ban = null;
  localModel.chat = null;
}

onMounted(() => {
  getChannelOptions();
  clearSearchFields();
});

onActivated(() => {
  clearSearchFields();
});

function reset() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  clearSearchFields();
  emit("reset");
}

function search() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  emit("search");
}

const userStatusOptions: SelectOption[] = [
  { value: "", label: "全部" },
  { value: "ban", label: "已封禁" },
  { value: "chat", label: "已禁言" },
  { value: "both", label: "已封禁且禁言" },
];
</script>

<template>
  <NCard
    :bordered="false"
    size="small"
    class="card-wrapper"
    :title="$t('common.search')"
    name="user-search"
  >
    <!-- <NCollapse> -->
    <!-- <NCollapseItem :title="$t('common.search')" name="user-search"> -->
    <NForm :model="localModel" label-placement="left" :label-width="80">
      <NGrid responsive="screen" item-responsive>
        <!-- <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.serverwhite.selectchannel')" path="channelId" class="pr-24px">
              <NSelect
                v-model:value="localModel.channelId"
                :placeholder="$t('page.manage.serverwhite.form.selectchannel')"
                :options="channeOptions"
                :loading="loadingChannel"
              />
            </NFormItemGi> -->

        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.gmrole.userId')"
          path="userId"
          class="pr-24px"
        >
          <NInput
            :value="localModel.userId"
            @update:value="handleUserIdInput"
            :placeholder="$t('page.manage.gmrole.form.userId')"
            :maxlength="maxUserIdLength"
            clearable
            style="width: 100%"
          />
        </NFormItemGi>

        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.gmrole.openId')"
          path="openId"
          class="pr-24px"
        >
          <NInput
            :value="localModel.openId"
            @update:value="handleOpenIdInput"
            :placeholder="$t('page.manage.gmrole.form.openId')"
            :maxlength="maxOpenIdLength"
            clearable
            style="width: 100%"
          />
        </NFormItemGi>

        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.gmrole.userStatus')"
          path="userStatus"
          class="pr-24px"
        >
          <NSelect v-model:value="userStatus" :options="userStatusOptions" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6">
          <NSpace class="w-full" justify="end">
            <NButton @click="reset">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t("common.reset") }}
            </NButton>
            <NButton type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              {{ $t("common.search") }}
            </NButton>
          </NSpace>
        </NFormItemGi>
      </NGrid>
    </NForm>
    <!-- </NCollapseItem> -->
    <!-- </NCollapse> -->
  </NCard>
</template>
<style scoped></style>
