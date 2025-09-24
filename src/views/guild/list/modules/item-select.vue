<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { $t } from "@/locales";
import { fetchGetServerList } from "@/service/api";
import type { SelectOption, SelectGroupOption } from "naive-ui"; // 导入 Naive UI 类型

defineOptions({
  name: "ItemSelect",
});

interface Props {
  model: {
    serverId?: string;
  };
}

interface Emits {
  (e: "reset"): void;
  (e: "search", serverId: string): void;
}

const emit = defineEmits<Emits>();

// 用 reactive 包裹
const model = ref({
  serverId: null,
});

// 监听 props 变化
watch(
  () => model.value.serverId,
  (newVal) => {
    emit("search", newVal);
  }
);

// 服务器选项状态
const serverOptions = ref<(SelectOption | SelectGroupOption)[]>([]);
const loading = ref(false);

// 获取服务器列表
async function loadServerData() {
  loading.value = true;
  try {
    const responseWrapper = await fetchGetServerList();
    let formattedOptions: (SelectOption | SelectGroupOption)[] = [];

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

        // 设置默认选中第一个服务器
        if (
          serverGroups.length > 0 &&
          serverGroups[0].children &&
          serverGroups[0].children.length > 0
        ) {
          model.value.serverId = serverGroups[0].children[0].value;
        }
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
    serverOptions.value = [];
    console.error("Error during fetch server list API call:", error);
  } finally {
    loading.value = false;
  }
}
loadServerData();

// 挂载时加载服务器
onMounted(() => {
  loadServerData();
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper" :title="$t('common.search')" name="user-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.gmrole.serverId')"
              path="serverId"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.serverId"
                :options="serverOptions"
                :loading="loading"
                :placeholder="$t('page.manage.gmrole.form.serverId')"
                filterable
                clearable
              />
            </NFormItemGi>
          </NGrid>
        </NForm>
  </NCard>
</template>

<style scoped></style>
