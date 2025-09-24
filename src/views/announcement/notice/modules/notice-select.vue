<script setup lang="ts">
import { ref, watch } from "vue";
import { $t } from "@/locales";
import { fetchGetServer } from "@/service/api";

defineOptions({
  name: "noticeSelect",
});

interface Emits {
  (e: "reset"): void;
  (e: "search", id: string): void;
}
const emit = defineEmits<Emits>();

const channeOptions = ref<CommonType.Option<string>[]>([]);
const expanded = ref(true);

const model = ref({
  regionId: "",
});


async function getServerGroupOptions() {
  try {
    const data = await fetchGetServer();
    if (data?.response?.data?.rows && Array.isArray(data.response.data.rows)) {
      channeOptions.value = data.response.data.rows.map((item: Api.SystemManage.serveritem) => ({
        label: item.regionName,
        value: item.id,
      }));
    }
  } catch (error) {
    window.$message?.error($t("common.requestFailed"));
  }
}

getServerGroupOptions();

watch(() => model.value.regionId, (newVal) => {
  if (newVal) {
    emit("search", newVal);
  }
});

</script>
<template>
  <NCard :bordered="false" size="small" class="card-wrapper" :title="$t('common.ControlPanel')">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.norice.selectregion')" path="regionId" class="pr-24px">
              <NSelect
                v-model:value="model.regionId"
                :placeholder="$t('page.manage.serveritem.form.selectgroup')"
                :options="channeOptions"
              />
            </NFormItemGi>
          </NGrid>
        </NForm>
  </NCard>
</template>

<style scoped></style>
