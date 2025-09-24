import { request } from '../request';
import { storeJsonData, getJsonData, safeJsonParse } from '@/utils/indexedDB';

const MONITOR_URL = import.meta.env.VITE_MONITOR_SERVICE_URL;

// 获取服务器信息
export function fetchServerInfo(serverId: number, language?: string) {
  return request({
    // url: `${MONITOR_URL}/server?server_id=${serverId}`,
    url: `/platform-operate/monitor/server2?server_id=${serverId}`,
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  });
}

// 获取服务器地图
export function fetchServerMap(language?: string) {
  return request({
    url: `${MONITOR_URL}/map?language=${language}`,
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  });
}
// 获取任务名称
export function fetchGetQuestName(params: URLSearchParams) {
  return request({
    url: `${MONITOR_URL}/quest?${params.toString()}`,
    method: 'get',
  });
}

//config
export function fetchConfig(serverId: number, language?: string) {
  return request({
    url: `${MONITOR_URL}/server/config?server_id=${serverId}`,
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export function fetchGetSKillName(params: URLSearchParams) {
  return request({
    url: `${MONITOR_URL}/skill?${params.toString()}`,
    method: 'get',
  });
}

// export function fetchsummary(serverId: number, language?: string) {
//   return request({
//     url: `${MONITOR_URL}/server/summary`,
//     method: 'get',
//     headers: {
//       'Accept': 'application/json'
//     }
//   })
// }


export function fetchsummary(serverId: number, language?: string) {
  return request({
    url: `/platform-operate/monitor/server/summary`,
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  })
}

// 获取模板
export function fetchGetMailTemplateList() {
  return request({
    url: `${MONITOR_URL}/mail`,
    method: 'get',
  });
}

// export function fetchGetMailTemplateList() {
//   return request({
//     url: `/platform-operate/monitor/mail`,
//     method: 'get',
//   });
// }

// 获取邮件物品
export function fetchGetMailItem() {
  return request({
    url: `${MONITOR_URL}/data-package`,
    method: 'get',
  })
}

// 获取数据包版本号
export function fetchGetPackageVersion() {
  return request({
    url: `${MONITOR_URL}/data-package/versions`,
    method: 'get',
  })
}

/**
 * 获取CS包并存储到IndexedDB
 * @param language 语言代码，默认为'CS'
 * @returns Promise<any> 解析后的JSON对象
 */
// export async function fetchAndStoreCsPackageData(language: string = 'CS'): Promise<any> {
//   try {
//     // 加上时间戳参数，防止缓存
//     // const response = await fetch(`${MONITOR_URL}/data-package?language=${language}`);
//     const url = `${MONITOR_URL}/data-package?language=${language}&t=${Date.now()}`;
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`HTTP错误! 状态: ${response.status}`);
//     }

//     const jsonString = await response.text();

//     // 存储到IndexedDB
//     await storeJsonData(jsonString);

//     // 从IndexedDB读取并解析
//     const storedData = await getJsonData();

//     if (!storedData) {
//       throw new Error('未找到存储的数据');
//     }

//     const jsonObject = safeJsonParse(storedData);

//     return jsonObject;
//   } catch (error) {
//     console.error('获取CS包数据失败:', error);
//     throw error;
//   }
// }


/**
 * 获取CS包并存储到IndexedDB（仅在版本变化时更新）
 * @param language 语言代码，默认为 'CS'
 * @returns Promise<any> 解析后的JSON对象
 */
export async function fetchAndStoreCsPackageData(language: string = 'CS'): Promise<any> {
  try {
    // const url = `/api${MONITOR_URL}/data-package?language=${language}&t=${Date.now()}`;
    const url = `${MONITOR_URL}/data-package?language=${language}&t=${Date.now()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }

    const jsonString = await response.text();
    const newJson = safeJsonParse(jsonString);
    const newVersion = newJson?.version;

    if (!newVersion) {
      throw new Error('远端数据包中未包含版本号');
    }

    // 获取本地缓存数据
    const storedDataStr = await getJsonData();
    if (storedDataStr) {
      const storedJson = safeJsonParse(storedDataStr);
      const storedVersion = storedJson?.version;

      if (storedVersion === newVersion) {
        return storedJson;
      }
    }

    // 存储新数据包
    await storeJsonData(jsonString, newVersion);
    return newJson;

  } catch (error) {
    console.error('获取CS包数据失败:', error);
    throw error;
  }
}


// 获取地图数据
export function fetchGetMapData(serverId: number) {
  return request({
    url: `/platform-operate/map/detail?serverId=${serverId}`, // 注意这里是 serverId
    method: 'get',
  });
}

// 开启地图
export function fetchOpenMap(params: {
  gameId: number;
  serverId: number;
  mapId: number;
  channelId: number;
}) {
  return request({
    url: `/platform-operate/map/openLine`,
    method: 'get',
    params: params,
  });
}

// 关闭地图
export function fetchCloseMap(params: { gameId: number; serverId: number; mapId: number; channelId: number  }) {
  return request({
    url: `/platform-operate/map/closeLine`,
    method: 'get',
    params: params,
  });
}

// 踢地图人岛主城
export function fetchKickMap(params: { gameId: number; serverId: number; mapId: number; channelId: number  }) {
  return request({
    url: `/platform-operate/map/kickMapPlayer`,
    method: 'get',
    params: params,
  });
}

// 设置地图最大人数
export function fetchSetMapMaxPlayer(params: { gameId: number; serverId: number; mapId: number; channelId: number; maxPlayerCount: number }) {
  return request({
    url: `/platform-operate/map/setLineMaxPlayerCount`,
    params: params,
    method: 'get',
  });
}

// 获取副本
export function fetchCopyList(serverId: number) {
  return request({
    url: `/platform-operate/induns/detail?serverId=${serverId}`,
    method: 'get',
  });
}

// 清空服务器
export function fetchClearServer(serverId: number) {
  return request({
    url: `/platform-operate/monitor/clear?serverId=${serverId}`,
    method: 'get',
  });
}
