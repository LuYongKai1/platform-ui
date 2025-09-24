<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import {  fetchAddChannel, fetchUpdateChannel } from "@/service/api";
import { $t } from "@/locales";
import { channelenableOptions } from "@/constants/business";

defineOptions({
  name: "channelOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.channel | null;
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
    add: $t("page.manage.channel.addchannel"),
    edit: $t("page.manage.channel.editChannel"),
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.channel,
  | "channelId"
  | "channelName"
  | "channelBriefName"
  | "clientNotifyEnable"
  // | "platform"
  | "enable"
>;

const model = ref(createDefaultModel());

// 添加表单验证规则
const rules = {
  channelBriefName: defaultRequiredRule,
  clientNotifyEnable: defaultRequiredRule,
  platform: defaultRequiredRule,
  enable: defaultRequiredRule,
};

function createDefaultModel(): Model {
  return {
    channelId: "",
    channelName: "",
    channelBriefName: "",
    clientNotifyEnable: "",
    // platform: "",
    enable: "",
  };
}

// 是否禁用字段编辑
const isEditMode = computed(() => props.operateType === "edit");

function handleInitModel() {
  model.value = createDefaultModel();


  if (props.operateType === "edit" && props.rowData) {
    Object.assign(model.value, {
      channelId: props.rowData.channelId || "",
      channelName: props.rowData.channelName || "",
      channelBriefName: props.rowData.channelBriefName || "",
      channelUserTotal: String(props.rowData.channelUserTotal ?? ""), // 确保是字符串
      platform: String(props.rowData.platform ?? ""),
      enable: String(props.rowData.enable ?? ""),
    });
  }
}


function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  try {
    const userData = {
      ...model.value,
    };
    if (props.operateType === "add") {
      await fetchAddChannel(userData);
      window.$message?.success($t("common.addSuccess"));
    } else {
      const { data, error } = await fetchUpdateChannel(userData);
      window.$message?.success($t("common.updateSuccess"));
    }

    closeDrawer();
    emit("submitted");
  } catch (error) {
    window.$message?.error($t("common.requestFailed"));
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    // getRoleOptions();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
<!--
        <NFormItem :label="$t('page.manage.channel.channelId')" path="channelId">
          <NInput
            v-model:value="model.channelId"
            :placeholder="$t('page.manage.channel.form.channelId')"
            :disabled="isEditMode"
          />
        </NFormItem> -->



        <NFormItem :label="$t('page.manage.channel.channelName')" path="channelName">
          <NInput
            v-model:value="model.channelName"
            :placeholder="$t('page.manage.channel.form.channelName')"
            :disabled="isEditMode"
          />
        </NFormItem>

        <NFormItem :label="$t('page.manage.channel.channelBriefName')" path="channelBriefName">
          <NInput
            v-model:value="model.channelBriefName"
            :placeholder="$t('page.manage.channel.form.channelBriefName')"
          />
        </NFormItem>

        <NFormItem
            span="24 m:24"
            :label="$t('page.manage.channel.enable')"
            path="enable"
          >
            <NRadioGroup v-model:value="model.enable">
              <NRadio
                v-for="item in channelenableOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItem>

      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t("common.cancel") }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{
            $t("common.confirm")
          }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
