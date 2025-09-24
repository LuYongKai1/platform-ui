<script setup lang="ts">
import { ref, watch, reactive, onMounted, onActivated } from "vue";
import { $t } from "@/locales";
import { fetchGetServerList } from "@/service/api"; // 导入 API
import type { SelectOption, SelectGroupOption } from "naive-ui"; // 导入 Naive UI 类型

defineOptions({
  name: "whiteSelect",
});

interface Props {
  model: {
    gameId?: string;
    gameName?: string;
    openId?: string;
    roleId?: string;
    roleName?: string;
    serverId?: string | number | null;
    ban?: boolean | null;
    chat?: boolean | null;
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
    gameId: "",
    gameName: "",
    openId: "",
    roleId: "",
    roleName: "",
    serverId: null,
    ban: null,
    chat: null,
  }
);

const maxRoleIdLength = 19;

let searchTimer: number | null = null;

// 验证数字输入
function validateNumberInput(value: string): boolean {
  return /^\d*$/.test(value);
}

// 处理平台ID输入
function handleOpenIdInput(value: string) {
  if (validateNumberInput(value)) {
    localModel.openId = value;
  }
}

// 处理角色ID输入
function handleRoleIdInput(value: string) {
  if (validateNumberInput(value)) {
    if (value.length <= maxRoleIdLength) {
      localModel.roleId = value;
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
  () => localModel.openId,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.roleId,
  (newValue, oldValue) => {
    if (newValue && newValue.length > maxRoleIdLength) {
      localModel.roleId = newValue.slice(0, maxRoleIdLength);
      return;
    }

    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.serverId,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      debounceSearch();
    }
  }
);

watch(
  () => localModel.roleName,
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
const loadingChannel = ref(false);
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
    // 全部
    localModel.ban = null;
    localModel.chat = null;
  }
  debounceSearch();
});

const serverOptions = ref<(SelectOption | SelectGroupOption)[]>([]);
const loading = ref(false);
const channeOptions = ref<SelectOption[]>([]);

function createAllOption(): SelectOption {
  return { value: "", label: "全部" };
}

async function loadServerData() {
  loading.value = true;
  try {
    const responseWrapper = await fetchGetServerList();
    const allOption = createAllOption();
    let formattedOptions: (SelectOption | SelectGroupOption)[] = [allOption];

    if (
      responseWrapper &&
      responseWrapper.response &&
      responseWrapper.response.data
    ) {
      const serverListData = responseWrapper.response.data;
      if (Array.isArray(serverListData)) {
        const serverGroups: SelectGroupOption[] = serverListData.map(
          (group: any) => ({
            type: "group",
            label: group.groupName || `Group ${group.id}`,
            key: group.id,
            children: Array.isArray(group.serverItems)
              ? group.serverItems.map((server: any) => ({
                  value: server.serverId,
                  label: `${server.serverId}-${
                    server.serverName || "Unknown Server"
                  }`,
                }))
              : [],
          })
        );
        formattedOptions = formattedOptions.concat(serverGroups);
      } else {
        console.error(
          "Server list data (in response.response.data) is not an array:",
          serverListData
        );
      }
    } else {
      console.error(
        "Failed to fetch server list, responseWrapper.response or responseWrapper.response.data is missing:",
        responseWrapper
      );
    }
    serverOptions.value = formattedOptions;
  } catch (error) {
    serverOptions.value = [createAllOption()];
    console.error("Error during fetch server list API call:", error);
  } finally {
    loading.value = false;
  }
}

// 清空搜索条件
function clearSearchFields() {
  userStatus.value = "";
  localModel.roleId = "";
  localModel.roleName = "";
  localModel.serverId = "";
  localModel.ban = null;
  localModel.chat = null;
}

onMounted(() => {
  loadServerData();
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

// 搜索方法
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
  <NCard :bordered="false" size="small" class="card-wrapper" :title="$t('common.search')" name="user-search">
    <!-- <NCollapse> -->
      <!-- <NCollapseItem > -->
        <NForm :model="localModel" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
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
                clearable
                style="width: 100%"
              />
            </NFormItemGi>

            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.gmrole.roleId')"
              path="roleId"
              class="pr-24px"
            >
              <NInput
                :value="localModel.roleId"
                @update:value="handleRoleIdInput"
                :placeholder="$t('page.manage.gmrole.form.roleId')"
                :maxlength="maxRoleIdLength"
                clearable
                style="width: 100%"
              />
            </NFormItemGi>

            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.gmrole.roleName')"
              path="roleName"
              class="pr-24px"
            >
              <NInput
                v-model:value="localModel.roleName"
                :placeholder="$t('page.manage.gmrole.form.roleName')"
              />
            </NFormItemGi>

            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.gmrole.serverId')"
              path="serverId"
              class="pr-24px"
            >
              <NSelect
                v-model:value="localModel.serverId"
                :options="serverOptions"
                :loading="loading"
                :placeholder="$t('page.manage.gmrole.form.serverId')"
                filterable
              />
            </NFormItemGi>

            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.gmrole.userStatus')"
              path="userStatus"
              class="pr-24px"
            >
              <NSelect
                v-model:value="userStatus"
                :options="userStatusOptions"
              />
            </NFormItemGi>

            <NFormItemGi span="24 m:18" class="pr-24px">
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


<style scoped>
</style>
