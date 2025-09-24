<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFormRules, useNaiveForm } from "@/hooks/common/form";
import { fetchCreateNotice, fetchUpdateNotice } from "@/service/api";
import { $t } from "@/locales";
import {
  serverNoticeStatusOptions,
  serverNoticeOptions,
  serverNoticeLabelOptions,
  serverNewOptions,
} from "@/constants/business";
import {
  NUl,
  NCheckboxGroup,
  NCheckbox,
  NSpace,
  NDatePicker,
  NInput,
  NButton,
  NFormItemGi,
  NRadioGroup,
  NRadio,
  NInputNumber,
  NModal,
  NScrollbar,
  NGrid,
  type FormItemRule,
  type FormRules,
} from "naive-ui";

defineOptions({
  name: "noticeOperateDrawer",
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.norice | null;
  /** selected region id */
  selectedRegionId?: string;
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

const rules: FormRules = {
  noticeName: defaultRequiredRule,
  noticeIndex: [
      { required: true, message: $t('page.manage.norice.form.noticeIndexRequired'), trigger: ['input', 'blur'], type: 'number' },
      {
          trigger: ['input', 'blur'],
          validator(rule: FormItemRule, value: number | null) {
              if (value !== null && value < 0) {
              }
              return true;
          }
      }
  ],
  noticeType: defaultRequiredRule,
  noticeExplain: defaultRequiredRule,
  enable: defaultRequiredRule,
  noticeContent: {
    required: true,
    trigger: ['input', 'blur', 'change'],
    validator(rule: FormItemRule, value: Array<{ title: string; content: string; }>) {
      if (!value || value.length === 0 || !value.some(item => item.content?.trim())) {
        return new Error($t('page.manage.norice.form.contentRequired'));
      }
      return true;
    }
  }
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t("page.manage.norice.noriceadd"),
    edit: $t("page.manage.norice.noriceedit"),
  };
  return titles[props.operateType];
});

type Model = {
  id?: number;
  gameId: number;
  regionId: string;
  noticeName: string;
  noticeIndex: number | null;
  noticeType: string;
  noticeExplain: string;
  enable: string;
  startDate: number | null;
  endDate: number | null;
  noticeContent: Array<{ title: string; content: string; }>;
};

const model = ref<Model>(createDefaultModel());
function createDefaultModel(): Model {
  const now = Date.now();
  return {
    id: undefined,
    gameId: 1,
    regionId: "",
    noticeName: "",
    noticeIndex: 1,
    noticeType: "",
    noticeExplain: "",
    enable: "0",
    startDate: now,
    endDate: now,
    noticeContent: [{ title: "", content: "" }],
  };
}

function handleInitModel() {
  if (props.operateType === 'edit' && props.rowData) {
    const row = props.rowData;

    let initialContent: Array<{ title: string; content: string; }> = [{ title: '', content: '' }];
    if (typeof row.noticeContent === 'string' && row.noticeContent.trim() !== '') {
      try {
        const parsed = JSON.parse(row.noticeContent);
        if (Array.isArray(parsed)) {
          initialContent = parsed.map(item => ({
            title: String(item?.title ?? ''),
            content: String(item?.content ?? '')
          }));
        } else if (typeof parsed === 'object' && parsed !== null) {
           initialContent = [{ title: String(parsed?.title ?? ''), content: String(parsed?.content ?? '')}];
        } else {
           initialContent = [{ title: '', content: String(row.noticeContent) }];
        }
      } catch (e) {
          initialContent = [{ title: '', content: String(row.noticeContent) }];
      }
    } else if (Array.isArray(row.noticeContent)) {
       initialContent = row.noticeContent.map(item => ({
         title: String(item?.title ?? ''),
         content: String(item?.content ?? '')
       }));
    }
    if (initialContent.length === 0) {
       initialContent = [{ title: '', content: '' }];
    }

    // Determine the string value ('1' or '0') for model.enable
    let enableStringValue: string = '0'; // Default to disabled
    const enableValue = row.enable;
    const enableValueString = String(enableValue).toLowerCase(); // Convert to lowercase string

    // Check if the string representation indicates 'enabled'
    if (enableValueString === '1' || enableValueString === 'true') {
      enableStringValue = '1';
    }
    // All other string values ('0', 'false', null, undefined, etc.) will result in '0'

    model.value = {
      id: row.id,
      gameId: Number(row.gameId ?? 1),
      regionId: String(row.regionId ?? ''),
      noticeName: String(row.noticeName ?? ''),
      noticeIndex: row.noticeIndex ? Number(row.noticeIndex) : null,
      noticeType: String(row.noticeType ?? ''),
      noticeExplain: String(row.noticeExplain ?? ''),
      enable: enableStringValue,          // Assign the determined string value
      startDate: row.startDate ? new Date(row.startDate).getTime() : Date.now(),
      endDate: row.endDate ? new Date(row.endDate).getTime() : Date.now(),
      noticeContent: initialContent,
    };
  } else {
    model.value = createDefaultModel();
  }
}

function closeDrawer() {
  visible.value = false;
}

// Helper function to format date-time in local timezone according to ISO 8601 (T separator)
function formatLocalDateTime(timestamp: number | null): string | null {
  if (timestamp === null) return null;
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  // Use 'T' as the separator instead of space
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

async function handleSubmit() {
  await validate();
  try {
    const formattedStartDate = formatLocalDateTime(model.value.startDate);
    const formattedEndDate = formatLocalDateTime(model.value.endDate);

    const commonData = {
      gameId: model.value.gameId,
      regionId: Number(model.value.regionId),
      noticeName: model.value.noticeName,
      noticeIndex: model.value.noticeIndex,
      noticeType: model.value.noticeType,
      noticeExplain: model.value.noticeExplain,
      enable: model.value.enable === "1",
      startDate: formattedStartDate || formatLocalDateTime(Date.now()), // Use current time if null
      noticeContent: model.value.noticeContent,
    };

    if (props.operateType === "add") {
       const addData = {
         ...commonData,
         endDate: formattedEndDate || formatLocalDateTime(Date.now()), // Use current time if null
       };
      await fetchCreateNotice(addData);
      window.$message?.success($t("common.addSuccess"));
    } else {
       const updateData = {
         id: model.value.id,
         ...commonData,
         endDate: formattedEndDate || formatLocalDateTime(Date.now()), // Use current time if null
       };
      await fetchUpdateNotice(updateData);
      window.$message?.success($t("common.updateSuccess"));
    }

    closeDrawer();
    emit("submitted");
  } catch (error) {
    window.$message?.error($t("common.requestFailed"));
  }
}

function addContent() {
  if (Array.isArray(model.value.noticeContent)) {
      model.value.noticeContent.push({ title: "", content: "" });
  }
}

function removeContent(index: number) {
  if (Array.isArray(model.value.noticeContent)) {
     model.value.noticeContent.splice(index, 1);
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    handleInitModel();
    restoreValidation();
  }
});
</script>


<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-700px">
    <NScrollbar class="h-500px pr-50px">
      <NForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="left"
        :label-width="100"
      >
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.norice.noticeName')"
            path="noticeName"
          >
            <NInput
              v-model:value="model.noticeName"
              :placeholder="$t('page.manage.norice.form.noticeName')"
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.norice.noticeIndex')"
            path="noticeIndex"
          >
            <NInputNumber
              v-model:value="model.noticeIndex"
              :placeholder="$t('page.manage.norice.form.noticeIndex')"
              :min="0"
            />
          </NFormItemGi>

          <!-- <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.norice.noticeType')"
            path="noticeType"
          >
            <NRadioGroup v-model:value="model.noticeType">
              <NRadio
                v-for="item in serverNoticeOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi> -->

          <!-- <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.norice.noticeExplain')"
            path="noticeExplain"
          >
            <NRadioGroup v-model:value="model.noticeExplain">
              <NRadio
                v-for="item in serverNoticeLabelOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi> -->


          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.norice.createDate')"
          >
            <NDatePicker
              v-model:value="model.startDate"
              type="datetime"
              :placeholder="$t('page.manage.norice.form.createDate')"
              clearable
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:12"
            :label="$t('page.manage.norice.updateDate')"
          >
            <NDatePicker
              v-model:value="model.endDate"
              type="datetime"
              :placeholder="$t('page.manage.norice.form.updateDate')"
              clearable
            />
          </NFormItemGi>

          <NFormItemGi
            span="24 m:24"
            :label="$t('page.manage.norice.enable')"
            path="enable"
          >
            <NRadioGroup v-model:value="model.enable">
              <NRadio
                v-for="item in serverNoticeStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi>

          <NFormItemGi
            span="24"
            :label="$t('page.manage.norice.content')"
            path="noticeContent"
          >
            <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
              <div
                v-for="(item, index) in model.noticeContent"
                :key="index"
                style="width: 100%; border: 1px solid #eee; padding: 10px; border-radius: 4px;"
              >
                <NInput
                  v-model:value="item.title"
                  placeholder="Title"
                  style="margin-bottom: 8px; width: 100%"
                />
                <NInput
                  v-model:value="item.content"
                  type="textarea"
                  :rows="3"
                  placeholder="Content"
                  style="margin-bottom: 8px; width: 100%"
                />
                <NButton
                  v-if="model.noticeContent.length > 1"
                  @click="removeContent(index)"
                  style="margin-bottom: 8px"
                >
                  {{ $t("common.cancel") }}
                </NButton>
              </div>
              <div style="margin-top: 8px">
                <NButton type="primary" @click="addContent">
                  {{ $t("common.add") }}
                </NButton>
              </div>
            </div>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">{{ $t("common.cancel") }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{
          $t("common.confirm")
        }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
