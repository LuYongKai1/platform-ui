<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { $t } from "@/locales";
import { fetchGetChannelList } from "@/service/api";

defineOptions({ name: "ProductsSearch" });

interface Emits {
  (e: "reset"): void;
  (
    e: "search",
    channelId: string,
    channelName: string,
    channelProductId: string | null,
    gameProductId: string | null
  ): void;
}
const emit = defineEmits<Emits>();

// 表单模型
const model = reactive({
  channelId: "",
  channelProductId: null,
  gameProductId: null,
});

// 渠道数据
const channelOptions = ref<CommonType.Option<string>[]>([
  { label: $t("common.all" as any), value: "" },
]);
const channelLoading = ref(false);

// 是否允许触发搜索（避免初始化时误触发）
const shouldTriggerSearch = ref(false);

// 计算选中渠道名称
const selectedChannelName = computed(
  () =>
    channelOptions.value.find((o) => o.value === model.channelId)?.label || ""
);

// 获取渠道列表
async function getChannelOptions() {
  channelLoading.value = true;
  try {
    const { error, data } = await fetchGetChannelList();
    if (!error && Array.isArray(data)) {
      channelOptions.value = [
        { label: $t("common.all" as any), value: "" },
        ...data.map((item: Api.SystemManage.channel) => ({
          label: item.channelName,
          value: item.channelId.toString(),
        })),
      ];
    }
  } catch (err) {
    console.error("Error fetching channel options:", err);
  } finally {
    channelLoading.value = false;
  }
}

// 重置
function reset() {
  model.channelId = "";
  model.channelProductId = "";
  model.gameProductId = "";
  search();
  emit("reset");
}

// 搜索
function search() {
  if (!shouldTriggerSearch.value) return;
  emit(
    "search",
    model.channelId,
    selectedChannelName.value,
    model.channelProductId,
    model.gameProductId
  );
}

// 防抖搜索函数（500ms）
const debounceSearch = useDebounceFn(search, 500);

// 初始化
async function initializeData() {
  await getChannelOptions();
  shouldTriggerSearch.value = true;
  search();
}

// 监听表单任意字段变化
watch(
  () => [model.channelId, model.channelProductId, model.gameProductId],
  () => debounceSearch()
);

// 初始化数据
initializeData();
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
        <!-- 渠道选择 -->
        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.retention.selectchannel')"
          path="channelId"
          class="pr-24px"
        >
          <NSelect
            v-model:value="model.channelId"
            :placeholder="$t('page.manage.products.pleaseSelectChannel')"
            :options="channelOptions"
            :loading="channelLoading"
            clearable
            filterable
            :filter="(pattern, option) => option.label.includes(pattern)"
          />
        </NFormItemGi>

        <!-- 渠道产品ID -->
        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.products.channelProductId')"
          path="channelProductId"
          label-width="90"
        >
          <NInputNumber
            v-model:value="model.channelProductId"
            :placeholder="$t('page.manage.products.form.channelProductId')"
            @keyup.enter="search"
            controls-position="none"
            :show-button="false"
            style="width: 100%"
          />
        </NFormItemGi>

        <NFormItemGi
          span="24 s:12 m:6"
          :label="$t('page.manage.products.gameProductId')"
          path="gameProductId"
          label-width="90"
        >
          <NInputNumber
            v-model:value="model.gameProductId"
            :placeholder="$t('page.manage.products.form.gameProductId')"
            @keyup.enter="search"
            :show-button="false"
            style="width: 100%"
          />
        </NFormItemGi>

        <!-- 操作按钮 -->
        <NFormItemGi span="24 s:6">
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
  </NCard>
</template>

<style scoped>
.card-wrapper {
  margin-bottom: 16px;
}
</style>
