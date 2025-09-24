import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchGetServerId } from '@/service/api';

interface Server {
  serverId: number;
  serverName: string;
}

interface Region {
  id: number;
  regionName: string;
  children?: Server[];
}

export const useServerStore = defineStore('server', () => {
  const serverTreeOptions = ref<any[]>([]);
  const serverList = ref<Server[]>([]);
  const regionList = ref<Region[]>([]);

  async function fetchServerList() {
    try {
      const data = await fetchGetServerId();
      if (!data.response?.data) {
        throw new Error("获取服务器列表失败");
      }

      const regions = data.response.data as unknown as Region[];
      regionList.value = regions;

      // 构建树形结构
      const treeData = regions.map(region => {
        return {
          label: region.regionName,
          key: `region_${region.id}`,
          children: region.children?.map(server => ({
            label: server.serverName,
            key: String(server.serverId)
          })) || []
        };
      });

      serverTreeOptions.value = treeData;

      // 保存扁平化的服务器列表
      const servers: Server[] = [];
      regions.forEach(region => {
        if (region.children) {
          servers.push(...region.children);
        }
      });
      serverList.value = servers;

      return {
        success: true,
        data: {
          treeOptions: serverTreeOptions.value,
          serverList: serverList.value,
          regionList: regionList.value
        }
      };
    } catch (err) {
      console.error("获取服务器列表失败:", err);
      return {
        success: false,
        error: err
      };
    }
  }

  function searchServers(keyword: string) {
    if (!keyword) return serverList.value;
    return serverList.value.filter(server =>
      server.serverName.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  return {
    serverTreeOptions,
    serverList,
    regionList,
    fetchServerList,
    searchServers
  };
});
