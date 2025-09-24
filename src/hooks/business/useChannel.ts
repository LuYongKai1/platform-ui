import { ref } from 'vue';
import { $t } from '@/locales';
import { fetchGetChannelList } from '@/service/api';

/**
 * 渠道管理 Hook
 *
 * 功能：
 * - 获取渠道列表
 * - 包含加载状态管理
 * - 自动添加"全部"选项
 * - 错误处理
 */
export function useChannel() {
  const channelOptions = ref<CommonType.Option<string>[]>([]);
  const channelLoading = ref(false);

  /**
   * 获取渠道选项列表
   */
  async function getChannelOptions() {
    channelLoading.value = true;
    try {
      const { error, data } = await fetchGetChannelList();

      if (error) {
        console.error('Failed to fetch channels:', error);
        channelOptions.value = [{ label: $t('common.all' as any), value: '' }];
        return;
      }

      const allOption: CommonType.Option<string> = {
        label: $t('common.all' as any),
        value: ''
      };

      const options = Array.isArray(data) ? data.map((item: Api.SystemManage.channel) => ({
        label: item.channelName,
        value: item.channelId,
      })) : [];

      channelOptions.value = [allOption, ...options];
    } catch (error) {
      console.error('Error fetching channel options:', error);
      channelOptions.value = [{ label: $t('common.all' as any), value: '' }];
    } finally {
      channelLoading.value = false;
    }
  }

  /**
   * 重置渠道选项
   */
  function resetChannelOptions() {
    channelOptions.value = [];
  }

  return {
    channelOptions,
    channelLoading,
    getChannelOptions,
    resetChannelOptions
  };
}
