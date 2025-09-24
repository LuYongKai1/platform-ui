/**
 * IndexedDB工具类
 * 用于存储和管理CS包数据
 */

// 数据库名称和存储对象名称
const DB_NAME = 'JsonDataDB';
const STORE_NAME = 'jsonStorage';

/**
 * 打开或创建IndexedDB数据库
 * @returns Promise<IDBDatabase>
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      console.error('数据库打开失败:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * 存储JSON数据到IndexedDB
 * @param jsonString JSON字符串
 * @returns Promise<void>
 */
export async function storeJsonData(jsonString: string, version: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const timestamp = new Date().getTime();
    const request = store.put({
      id: 'currentData',
      jsonString: jsonString,
      timestamp: timestamp,
      version: version, // 添加版本号
    });

    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      console.error('存储失败:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

/**
 * 从IndexedDB读取JSON数据
 * @returns Promise<string | null>
 */
export async function getJsonData(): Promise<string | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get('currentData');
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.jsonString : null);
    };

    request.onerror = (event) => {
      console.error('读取失败:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

/**
 * 安全解析JSON字符串
 * @param jsonString JSON字符串
 * @returns 解析后的对象
 */
export function safeJsonParse(jsonString: string): any {
  try {
    // 尝试直接解析
    return JSON.parse(jsonString);
  } catch (initialError) {
    console.warn('直接解析失败，尝试修复...', initialError);

    // 尝试修复常见的JSON问题
    try {
      // 处理可能的双重转义
      const fixedJson = jsonString
        .replace(/\\\\"/g, '\\"')  // 修复双重转义引号
        .replace(/\\\\/g, '\\')    // 修复双重转义反斜杠
        .replace(/\\"/g, '"')       // 修复转义引号
        .replace(/^\uFEFF/, '');    // 移除BOM头

      return JSON.parse(fixedJson);
    } catch (repairError) {
      console.error('修复后解析仍然失败:', repairError);

      // 尝试定位错误位置
      const positionMatch = (repairError as Error).message.match(/at position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        console.error('错误位置附近的字符串:',
          jsonString.substring(Math.max(0, position - 20),
          Math.min(jsonString.length, position + 20)));
      }

      throw new Error('无法解析JSON数据');
    }
  }
}

/**
 * 清理IndexedDB中的JSON缓存
 * @returns Promise<void>
 */
export async function clearJsonData(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('currentData');
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}


