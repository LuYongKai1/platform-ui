<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { fetchGetServerId } from "@/service/api";
import { $t } from "@/locales";

defineOptions({
  name: "wordListSelect",
});

interface Server {
  serverId: number;
  serverName: string;
}

interface Region {
  createBy: null | string;
  createTime: null | string;
  updateBy: null | string;
  updateTime: null | string;
  remark: null | string;
  id: number;
  gameId: number;
  regionName: string;
  regionIndex: number;
  commonHost: string;
  commonPort: number;
  resUrl: string;
  maintenance: number;
  maintenanceMsg: string;
  clientVersionMin: string;
  clientVersionMax: string;
  channelMedia: string;
  whiteList: string;
  groupList: string;
  updateDate: null | string;
  children?: Server[];
}

interface Emits {
  (e: "reset"): void;
  (e: "search", serverId: number): void;
}

const emit = defineEmits<Emits>();

const serverTree = ref<any[]>([]);
const serverMap = ref<Record<string, number>>({});
const error = ref<string | null>(null);
const expanded = ref(true);

const model = ref({
  server: "",
});

onMounted(async () => {
  try {
    const data = await fetchGetServerId();

    if (!data.response?.data) {
      throw new Error("获取服务器列表失败");
    }

    const regions = data.response.data as unknown as Region[];

    serverTree.value = regions.map((region: Region) => ({
      key: `region_${region.id}`,
      label: region.regionName,
      children:
        region.children?.map((server: Server) => ({
          key: server.serverId,
          label: server.serverName,
        })) || [],
    }));

        // 构建服务器映射，用于调试或其他用途
    regions.forEach((region: Region) => {
      serverMap.value[region.regionName] = region.id;
      region.children?.forEach((server: Server) => {
        serverMap.value[server.serverName] = server.serverId;
      });
    });
  } catch (err) {
    error.value = "获取服务器列表失败: " + (err as Error).message;
  }
});

watch(
  () => model.value.server,
  (newVal) => {
    if (newVal) {
      // 现在只有服务器可以被选择，直接使用服务器ID
      if (typeof newVal === 'number' || (typeof newVal === 'string' && !isNaN(Number(newVal)))) {
        emit("search", Number(newVal));
        return;
      }

      console.warn("Invalid server selection value:", newVal);
    }
  }
);

const handleReset = () => {
  model.value.server = "";
  emit("reset");
};

// 控制节点是否可选择：只有叶子节点（服务器）可以选择，分组节点不可选择
const nodeSelectable = (option: any) => {
  // 如果节点有children且children不为空，说明是分组节点，不可选择
  if (option.children && option.children.length > 0) {
    return false;
  }
  // 如果key以region_开头，说明是区域节点，不可选择
  if (typeof option.key === 'string' && option.key.startsWith('region_')) {
    return false;
  }
  // 其他情况（服务器节点）可以选择
  return true;
};
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper"  :title="$t('common.search')" >

        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" class="pr-24px">
              <NTreeSelect
                v-model:value="model.server"
                :placeholder="
                  $t('page.manage.operateserver.form.mailServerJson')
                "
                :options="serverTree"
                clearable
                :multiple="false"
                check-strategy="child"
                :selectable="nodeSelectable"
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

