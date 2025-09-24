<script setup lang="ts">
import { $t } from "@/locales";
import { NButton, NPopconfirm, NSpace } from "naive-ui";

defineOptions({
  name: "UserOperation",
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledBan?: boolean; // 禁用封禁按钮
  disabledMute?: boolean; // 禁用禁言按钮
  disabledUnmute?: boolean; // 禁用解除禁言按钮
  disabledKick?: boolean; // 禁用踢出下线按钮
  loading?: boolean; // 加载状态
  showKick?: boolean; // 新增：控制踢下线按钮显示
}

defineProps<Props>();

interface Emits {
  (e: "ban"): void; // 封禁用户
  (e: "unban"): void; // 解封用户
  (e: "chat"): void; // 禁言用户
  (e: "unchat"): void; // 解除禁言
  (e: "kick"): void; // 踢出下线
  (e: 'refresh'): void;
}

const columns = defineModel<NaiveUI.TableColumnCheck[]>("columns", {
  default: () => [],
});

const emit = defineEmits<Emits>();


function refresh() {
  emit('refresh');
}
</script>


<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">

      <NPopconfirm
        v-if="showKick"
        @positive-click="emit('kick')"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
      >
        <template #trigger>
          <NButton
            size="small"
            ghost
            type="error"
            :disabled="disabledKick"
          >
            <template #icon>
              <icon-mdi-logout class="text-icon" />
            </template>
            {{ $t("common.kick") }}
          </NButton>
        </template>
        {{ $t("common.confirmKickMany") }}
      </NPopconfirm>

      <NButton size="small" @click="refresh">
        <template #icon>
          <icon-mdi-refresh
            class="text-icon"
            :class="{ 'animate-spin': loading }"
          />
        </template>
        {{ $t("common.refresh") }}
      </NButton>
      <TableColumnSetting v-model:columns="columns" />
    </slot>
    <slot name="suffix"></slot>
  </NSpace>
</template>
