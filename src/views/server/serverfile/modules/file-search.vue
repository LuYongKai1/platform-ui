<script setup lang="ts">
/**
 * 产品搜索组件
 *
 * 功能模块：
 * - 服务器选择：支持服务器筛选
 *
 * 特点：
 * - 完整国际化支持
 * - 实时搜索响应
 */
import { ref, watch, computed, onMounted } from "vue";
import { $t } from "@/locales";
import { useServerStore } from "@/store/modules/server";
import { debounce } from "@/utils/common";
import { rootDirectoryOptions } from "@/constants/business";

defineOptions({
  name: "FileSearch",
});

interface Emits {
  (e: "reset"): void;
  (
    e: "search",
    serverId: string,
    rootDirectory: string,
  ): void;
}
const emit = defineEmits<Emits>();

const serverStore = useServerStore();
const serverTreeOptions = computed(() => serverStore.serverTreeOptions);
const serverLoading = ref(false);
const shouldTriggerSearch = ref(false);

const model = ref({
  serverId: "",
  rootDirectory: "table",
  path: "",
});

const serverOptions = computed(() => {
  const options: CommonType.Option<string>[] = [];

  serverTreeOptions.value.forEach((region: any) => {
    if (region.children && region.children.length > 0) {
      region.children.forEach((server: any) => {
        options.push({
          label: server.label,
          value: server.key,
        });
      });
    }
  });

  return options;
});

// 树状根目录选项 - 基于 rootDirectoryOptions 构建
const rootDirectoryTreeOptions = computed(() => {
  const treeOptions: any[] = [];
  const scriptChildren: any[] = [];

  rootDirectoryOptions.forEach((option: any) => {
    if (option.value === 'table') {
      treeOptions.push({
        label: option.label,
        value: option.value,
      });
    } else if (option.value === 'script') {
      treeOptions.push({
        label: option.label,
        value: option.value,
        children: scriptChildren,
      });
    } else if (option.value.startsWith('script/')) {
      scriptChildren.push({
        label: option.label,
        value: option.value,
      });
    }
  });

  return treeOptions;
});

function getAllServerIds(): number[] {
  const serverIds: number[] = [];

  serverTreeOptions.value.forEach((region: any) => {
    if (region.children && region.children.length > 0) {
      region.children.forEach((server: any) => {
        serverIds.push(Number(server.key));
      });
    }
  });

  return serverIds;
}

async function initializeData() {
  serverLoading.value = true;
  try {
    await serverStore.fetchServerList();
  } catch (error) {
    console.error("Error fetching server list:", error);
  } finally {
    serverLoading.value = false;
  }

  const firstOption = serverOptions.value[0];
  if (!model.value.serverId && firstOption) {
    model.value.serverId = firstOption.value;
  }

  shouldTriggerSearch.value = true;

  if (model.value.serverId) {
    emit("search", model.value.serverId, model.value.rootDirectory);
  }
}


const debouncedSearch = debounce(
  (
    serverId: string,
    rootDirectory: string,
  ) => {
    emit("search", serverId, rootDirectory);
  },
  500
);

// 监听表单变化，自动触发搜索
watch(
  () => [
    model.value.serverId,
    model.value.rootDirectory,
  ],
  () => {
    if (!shouldTriggerSearch.value) return;
    debouncedSearch(
      model.value.serverId,
      model.value.rootDirectory,
    );
  }
);

onMounted(() => {
  initializeData();
});

// 暴露方法给父组件使用
defineExpose({
  getAllServerIds,
});
</script>

<template>
  <NCard
    :bordered="false"
    size="small"
    class="card-wrapper"
    :title="$t('common.search')"
  >
    <NForm :model="model" label-placement="left" :label-width="80">
      <NGrid responsive="screen" item-responsive>
        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.retention.selectserver')"
          path="serverId"
          class="pr-24px"
        >
          <NSelect
            v-model:value="model.serverId"
            :placeholder="$t('page.manage.retention.form.selectserver')"
            :options="serverOptions"
            :loading="serverLoading"
            clearable
          />
        </NFormItemGi>

        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.serverFile.Contents')"
          path="rootDirectory"
          class="pr-24px"
        >
          <NTreeSelect
            v-model:value="model.rootDirectory"
            :placeholder="$t('page.manage.serverFile.form.Contents')"
            :options="rootDirectoryTreeOptions"
            :loading="serverLoading"
            clearable
            key-field="value"
            label-field="label"
            children-field="children"
          />
        </NFormItemGi>

      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped>
.card-wrapper {
  margin-bottom: 16px;
}
</style>
