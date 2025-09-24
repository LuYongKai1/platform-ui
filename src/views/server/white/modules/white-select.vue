<script setup lang="ts">
import { ref, watch } from "vue";
import { $t } from "@/locales";
import { fetchGetChannelList } from "@/service/api";
// 注意：Api 类型通常是全局可用的，如果遇到类型错误，可能需要取消下面这行的注释
// import type { Api } from "@/typings/api";

defineOptions({
  name: "whiteSelect",
});

interface Emits {
  (e: "reset"): void;
  (e: "search", channelId: string): void;
}
const emit = defineEmits<Emits>();

const channeOptions = ref<CommonType.Option<string>[]>([]);
  const expanded = ref(true);

const model = ref({
  channelId: "",
});

async function getchanneOptions() {
  const { error, data } = await fetchGetChannelList();

  if (error) {
    console.error("Failed to fetch channels:", error);
    return;
  }

  // 定义 "全部" 选项
  const allOption: CommonType.Option<string> = { label: $t('common.all'), value: '' };

  // 明确指定 item 的类型为 Api.channel
  const options = data.map((item: Api.channel) => ({
    label: item.channelName,
    value: item.channelId,
  }));

  // 将 "全部" 选项添加到列表开头
  channeOptions.value = [allOption, ...options];
}

getchanneOptions();

watch(() => model.value.channelId, (newVal) => {
  emit("search", newVal);
});

</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper" :title="$t('common.ControlPanel')">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.serverwhite.selectchannel')" path="channelId" class="pr-24px">
              <NSelect
                v-model:value="model.channelId"
                :placeholder="$t('page.manage.serverwhite.form.selectchannel')"
                :options="channeOptions"
              />
            </NFormItemGi>
          </NGrid>
        </NForm>
  </NCard>
</template>

<style scoped></style>
