<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import {
  fetchAddWhiteListManage,
  fetchUpdateWhiteListManage,
} from "@/service/api";
import { $t } from "@/locales";
import { serverWhiteOptions, userGenderOptions } from "@/constants/business";

defineOptions({
  name: "WhiteOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.serverwhite | null;
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

// 添加表单验证规则
const rules = {
  itemName: defaultRequiredRule,
  itemValue: [
    defaultRequiredRule,
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\-_., ]+$/,
      message: $t('form.itemValueInvalid'),
      trigger: ['input', 'blur']
    }
  ],
  typeIp: defaultRequiredRule
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.serverwhite.addwhite"),
    edit: $t("page.manage.serverwhite.editwhite"),
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.serverwhite,
  "itemName" | "itemValue" | "typeIp" | "channelId"
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    itemName: "",
    itemValue: "",
    typeIp: "",
    channelId: 9000,
  };
}


function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === "edit" && props.rowData) {
    const {typeIp, ...rest } = props.rowData;
    Object.assign(model.value, {
      typeIp: typeIp !== undefined ? String(typeIp) : "",
      ...rest,
    });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  try {
    await validate();
    const Data = {
      ...model.value,
      channelId: 9000, //写死的
    };

    if (props.operateType === "add") {
      await fetchAddWhiteListManage(Data);
      window.$message?.success($t("common.addSuccess"));
    } else {
      await fetchUpdateWhiteListManage(Data);
      window.$message?.success($t("common.updateSuccess"));
    }

    closeDrawer();
    emit("submitted");
  } catch (error) {
    // 表单验证错误不显示错误消息
    if (error instanceof Error && error.message.includes('validation')) {
      return;
    }
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem
          :label="$t('page.manage.serverwhite.itemName')"
          path="itemName"
        >
          <NInput
            v-model:value="model.itemName"
            :placeholder="$t('page.manage.serverwhite.form.itemName')"
          />
        </NFormItem>

        <NFormItem
          :label="$t('page.manage.serverwhite.itemValue')"
          path="itemValue"
        >
          <NInput
            v-model:value="model.itemValue"
            :placeholder="$t('page.manage.serverwhite.form.itemValue')"
          />
        </NFormItem>

        <NFormItem :label="$t('page.manage.serverwhite.typeIp')" path="typeIp">
          <NRadioGroup v-model:value="model.typeIp">
            <NRadio
              v-for="item in serverWhiteOptions"
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
