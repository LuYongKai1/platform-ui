import { fetchGetPackageVersion, fetchAndStoreCsPackageData } from '@/service/api';
import { getJsonData, safeJsonParse, storeJsonData } from "@/utils/indexedDB";

export async function useItemPackage(): Promise<any> {
  try {
    const versionRes = await fetchGetPackageVersion();
    const latestVersion = ((versionRes?.response?.data as any)?.versions?.[0]?.version ?? '').toString().trim();

    const stored = await getJsonData();
    const local = safeJsonParse(stored as string);  // 从 IndexedDB 获取本地数据
    const localVersion = (local?.version ?? '').toString().trim();


    if (localVersion && localVersion === latestVersion) {
      return local;
    }

    return await fetchAndStoreCsPackageData();
  } catch (e) {
    console.error('[useItemPackage] 获取失败:', e);
    return null;
  }
}
