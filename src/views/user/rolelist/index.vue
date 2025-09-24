<script setup lang="tsx">
import {
  fetchGetgmuserlist,
  fetchGetVehicleInfo,
  fetchGetclientRoleList,
  fetchGetPetInfo,
  fetchGetProfessionInfo,
  fetchGetSKillInfo,
  fetchServerMap,
  fetchGetQuestInfo,
  fetchGetQuestName,
  fetchGetSKillName,
  fetchGetItemInfo
} from "@/service/api";
import { $t } from "@/locales";
import { useAppStore } from "@/store/modules/app";
import { useTable } from "@/hooks/common/table";
import { getJsonData, safeJsonParse } from '@/utils/indexedDB';
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchAndStoreCsPackageData } from "@/service/api/monitor";
import { useItemPackage } from '@/hooks/business/useItemPackage';


// 类型定义
interface Position {
  mapName: string;
  mapId: number;
  x: number;
  y: number;
  z: number;
}

interface RoleInfo {
  name: string;
  class: string;
  level: number;
  exp: number;
  power: number;
  hp: number;
  mp: number;
  position: Position;
}

interface OnlineUser {
  userId: number;
  channelId: string;
  ip: string;
  regDate: string;
  lastLoginTime: string;
  onlineTime: string;
}

interface NewUser {
  userId: number;
  channelId: string;
  ip: string;
  regDate: string;
  deviceType: string;
  source: string;
}

interface PetInfo {
  tid: number;
  name: string;
  level: number;
  satiety: number;
}

interface ProfessionInfo {
  grade: number;
  type: string;
  level: number;
}

interface SkillInfo {
  id: number;
  name: string;
  level: number;
}

interface QuestInfo {
  id: number;
  name: string;
  count: number;
  state: string;
  description?: string;
  objectValue?: number;
  mapId?: number;
  positionId?: number;
}

interface QuestHistoryInfo {
  id: number;
  name: string;
  completedDate: string;
  reward: string;
}

interface DailyQuestInfo {
  id: number;
  name: string;
  progress: number;
  maxProgress: number;
  reward: string;
}

interface ItemInfo {
  id: number;
  name: string;
  guid: string;
}

interface VehicleInfo {
  tid: number;
  level: number;
  exp: number;
  satiety: number;
  end_date: string;
  equip_uid: number[];
}

interface VehicleData {
  cur_vehicle: number;
  list_vehicle: VehicleInfo[];
  list_equip_vehicle: any[];
}

// 状态管理
const appStore = useAppStore();
const route = useRoute();
const activeTab = ref('all-users');

// 响应式数据
const roleInfo = ref<RoleInfo>({
  name: "",
  class: "",
  level: 0,
  exp: 0,
  power: 0,
  hp: 0,
  mp: 0,
  position: {
    mapName: "",
    mapId: 0,
    x: 0,
    y: 0,
    z: 0
  }
});

const mapData = ref<Record<string, string>>({});
const currentMapName = ref("");
const itemData = ref<any>(null);

// 列表数据
const petData = ref<PetInfo[]>([]);
const professionData = ref<ProfessionInfo[]>([]);
const skillData = ref<SkillInfo[]>([]);
const questData = ref<QuestInfo[]>([]);
const questHistoryData = ref<QuestHistoryInfo[]>([]);
const dailyQuestData = ref<DailyQuestInfo[]>([]);
const achieveData = ref<{gid: number, index: number, value: number}[]>([]);
const inventoryItems = ref<ItemInfo[]>([]);
const equipItems = ref<ItemInfo[]>([]);
const onlineUsersData = ref<OnlineUser[]>([]);
const newUsersData = ref<NewUser[]>([]);
const vehicleData = ref<VehicleData>({
  cur_vehicle: 0,
  list_vehicle: [],
  list_equip_vehicle: []
});

// 加载状态
const petDataLoading = ref(false);
const professionDataLoading = ref(false);
const skillDataLoading = ref(false);
const questDataLoading = ref(false);
const questHistoryDataLoading = ref(false);
const dailyQuestDataLoading = ref(false);
const achieveDataLoading = ref(false);
const vehicleDataLoading = ref(false);
const itemInfoLoading = ref(false);
const onlineUsersLoading = ref(false);
const newUsersLoading = ref(false);

// 其他状态
let typedCheckedRowKeys = ref<(string | number)[]>([]);

// 任务状态映射
const questStateMap = {
  1: '未开始',
  2: '进行中',
  3: '已完成'
};

// 所有用户的数据表格配置
const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams,
  updateSearchParams,
} = useTable({
  apiFn: fetchGetgmuserlist,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
    channelId: undefined,
  },
  columns: () => [
    {
      type: "selection",
      align: "center",
      width: 48,
    },
    {
      key: "index",
      title: $t("page.manage.gmuser.userId"),
      align: "center",
      width: 150,
    },
    {
      key: "index",
      title: $t("page.manage.gmuser.channelId"),
      align: "center",
      width: 150,
    },
    {
      key: "index",
      title: $t("page.manage.gmuser.ip"),
      align: "center",
      width: 150,
    },
    {
      key: "index",
      title: $t("page.manage.gmuser.regDate"),
      align: "center",
      width: 130,
    },
  ],
});

// 更新角色基本信息
const updateRoleInfo = () => {
  const roleName = route.query.roleName as string;
  const roleId = route.query.roleId as string;
  const roleInfoData = route.query.roleInfo as string;

  if (!roleName || !roleId) return;

  try {
    if (roleInfoData) {
      const parsedRoleInfo = JSON.parse(roleInfoData);
      roleInfo.value = {
        name: roleName,
        class: parsedRoleInfo.class,
        level: parsedRoleInfo.level || 0,
        exp: parsedRoleInfo.exp || 0,
        power: parsedRoleInfo.power || 0,
        hp: parsedRoleInfo.hp || 0,
        mp: parsedRoleInfo.mp || 0,
        position: {
          mapName: parsedRoleInfo.mapName || "",
          mapId: parsedRoleInfo.mapId || 0,
          x: parsedRoleInfo.x || 0,
          y: parsedRoleInfo.y || 0,
          z: parsedRoleInfo.z || 0
        }
      };
    } else {
      roleInfo.value = {
        name: roleName,
        class: "Warrior",
        level: 0,
        exp: 0,
        power: 0,
        hp: 0,
        mp: 0,
        position: {
          mapName: "",
          mapId: 0,
          x: 0,
          y: 0,
          z: 0
        }
      };
    }
  } catch (error) {
    console.error('解析角色信息失败:', error);
    window.$message?.error('解析角色信息失败');
  }
};

// 获取角色列表数据
async function getRoleList(roleId: string) {
  try {
    const response = await fetchGetclientRoleList({ roleId });
    if (!response?.data) return;

    const roleList = Array.isArray(response.data) ? response.data : [response.data];
    if (!roleList.length) return;

    const roleData = roleList[0];
    roleInfo.value.name = roleData.role_name || roleInfo.value.name;

    if (roleData.proto_data) {
      const { proto_data } = roleData;

      // 更新角色基础属性
      if (proto_data.level !== undefined) roleInfo.value.level = Number(proto_data.level);
      if (proto_data.exp !== undefined) roleInfo.value.exp = Number(proto_data.exp);
      if (proto_data.power !== undefined) roleInfo.value.power = Number(proto_data.power);

      // 更新角色状态属性
      if (proto_data.stat) {
        const { stat } = proto_data;
        if (stat.hp !== undefined) roleInfo.value.hp = Number(stat.hp);
        if (stat.mp !== undefined) roleInfo.value.mp = Number(stat.mp);
      }

      // 更新位置信息
      if (proto_data.zone) {
        const { zone } = proto_data;
        const mapId = zone.id || 0;

        roleInfo.value.position = {
          mapName: mapId ? `地图 ${mapId}` : "未知地图",
          mapId,
          x: Number(zone.x) || 0,
          y: Number(zone.y) || 0,
          z: Number(zone.z) || 0
        };

        getMapInfo(mapId);
      }
    }
  } catch (error) {
    console.error('获取角色列表数据失败:', error);
    window.$message?.error('获取角色列表数据失败');
  }
}

onMounted(async () => {
  try {
    const data = await useItemPackage();
    itemData.value = data;
  } catch (error) {
    console.error("获取物品数据失败:", error);
    itemData.value = null;
  }
});

// 获取地图信息
async function getMapInfo(forceMapId?: number) {
  try {
    // 如果已有地图数据，直接更新地图名称
    if (Object.keys(mapData.value).length > 0) {
      updateMapName(forceMapId);
      return;
    }
    // const response = await fetchServerMap('CS');
    // if (!response) return;

    let mapDataObj: Record<string, string> = {};
    if (itemData.value?.data?.map) {
      mapDataObj = itemData.value.data.map as Record<string, string>;
    } else if (itemData.value?.data?.map) {
      mapDataObj = itemData.value.data.map as Record<string, string>;
    }

    // 处理字符串格式的地图数据
    if (typeof mapDataObj === 'string') {
      try {
        mapDataObj = JSON.parse(mapDataObj);
      } catch (e) {
        console.error('解析地图数据字符串失败:', e);
      }
    }

    mapData.value = mapDataObj;
    updateMapName(forceMapId);
  } catch (error) {
    console.error('获取地图信息失败:', error);
    window.$message?.error('获取地图信息失败');
  }
}

// 更新地图名称
function updateMapName(forceMapId?: number) {
  const mapId = forceMapId !== undefined ? forceMapId : roleInfo.value.position.mapId;
  const mapIdStr = String(mapId);

  if (mapId && mapData.value[mapIdStr]) {
    currentMapName.value = mapData.value[mapIdStr];
    roleInfo.value.position.mapName = currentMapName.value;
  } else {
    roleInfo.value.position.mapName = roleInfo.value.position.mapId
      ? `地图 ${roleInfo.value.position.mapId}`
      : "未知地图";
  }
}

// 获取物品数据
// async function fetchItemData() {
//   try {
//     const storedData = await getJsonData();
//     if (storedData) {
//       itemData.value = safeJsonParse(storedData);
//     } else {
//       itemData.value = await fetchAndStoreCsPackageData();
//     }
//   } catch (error) {
//     console.error('获取物品数据失败:', error);
//     itemData.value = null;
//   }
// }



// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;

  const roleId = route.query.roleId as string;
  if (!roleId) return;

  // 根据标签页加载不同数据
  switch(tabName) {
    case 'all-users':
      updateRoleInfo();
      getRoleList(roleId);
      break;
    case 'online-users':
      getItemInfo(roleId);
      break;
    case 'pet':
      getPetInfo(roleId);
      if (!itemData.value) {
        logPetData();
        checkAndLoadActorData();
      } else {
        logPetData();
        checkAndLoadActorData();
      }
      break;
    case 'profession':
      getProfessionInfo(roleId);
      break;
    case 'Skill':
      getSkillInfo(roleId);
      break;
    case 'quests':
      getQuestData();
      getQuestHistoryData();
      break;
    case 'Vehicle':
      getVehicleInfo(roleId);
      break;
  }
};

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  updateRoleInfo();
  const roleId = newQuery.roleId as string;
  if (roleId) {
    getRoleList(roleId);

    // 根据当前标签页加载相应数据
    switch(activeTab.value) {
      case 'pet':
        getPetInfo(roleId);
        break;
      case 'profession':
        getProfessionInfo(roleId);
        break;
      case 'Skill':
        getSkillInfo(roleId);
        break;
      case 'quests':
        getQuestData();
        getQuestHistoryData();
        break;
      case 'Vehicle':
        getVehicleInfo(roleId);
        break;
      case 'online-users':
        getItemInfo(roleId);
        break;
    }
  }
}, { immediate: true });

// 初始化
onMounted(() => {
  getMapInfo();
  // fetchItemData();

  // 初始加载时检查是否应该加载物品数据
  const roleId = route.query.roleId as string;
  if (roleId && activeTab.value === 'online-users') {
    getItemInfo(roleId);
  }
});

// 获取宠物信息
async function getPetInfo(roleId: string) {
  if (!roleId) return;

  petDataLoading.value = true;
  try {
    const response = await fetchGetPetInfo({ roleId });
    if (!response?.data) {
      petData.value = [];
      return;
    }

    // 处理不同格式的宠物数据响应
    let pets = [];
    if (Array.isArray(response.data)) {
      pets = response.data;
    } else if (typeof response.data === 'object') {
      pets = response.data.list && Array.isArray(response.data.list)
        ? response.data.list
        : [response.data];
    }

    petData.value = pets;

    // 确保IndexedDB数据已加载并更新宠物名称
    if (itemData.value?.data?.actor && itemData.value?.data?.pet) {
      updatePetNamesFromActor();
    } else {
      try {
        const storedData = await getJsonData();
        if (storedData) {
          itemData.value = safeJsonParse(storedData);
          updatePetNamesFromActor();
        } else {
          const data = await fetchAndStoreCsPackageData();
          if (data) {
            itemData.value = data;
            updatePetNamesFromActor();
          }
        }
      } catch (error) {
        console.error('加载IndexedDB数据失败:', error);
      }
    }
  } catch (error) {
    console.error('获取宠物数据失败:', error);
    window.$message?.error('获取宠物数据失败');
    petData.value = [];
  } finally {
    petDataLoading.value = false;
  }
}

// 从Actor数据更新宠物名称
function updatePetNamesFromActor() {
  if (!itemData.value?.data?.actor || !itemData.value?.data?.pet || petData.value.length === 0) {
    return;
  }

  const petItems = itemData.value.data.pet;

  petData.value.forEach(pet => {
    const tidStr = String(pet.tid);
    const nameId = petItems[tidStr]?.name_id;

    if (!nameId) return;

    const foundActor = findActorByNameId(nameId);
    if (foundActor) {
      pet.name = extractActorName(foundActor);
    }
  });
}

// 根据name_id查找Actor
function findActorByNameId(nameId: string) {
  if (!itemData.value?.data?.actor) return null;

  const actorData = itemData.value.data.actor;

  // 方法1: 遍历查找带有匹配name_id的actor
  for (const actorId in actorData) {
    const actor = actorData[actorId];
    if (actor && actor.name_id === nameId) {
      return actor;
    }
  }

  // 方法2: 尝试直接通过name_id作为key查找
  if (actorData[nameId]) {
    return actorData[nameId];
  }

  // 方法3: 检查name_id的数字部分是否可以作为actorId
  const numericId = nameId.match(/\d+/)?.[0];
  if (numericId && actorData[numericId]) {
    return actorData[numericId];
  }

  return null;
}

// 提取Actor名称
function extractActorName(actor: any) {
  if (!actor) return '未知';

  // 优先使用names字段，提取中文名称
  if (actor.names) {
    if (typeof actor.names === 'object') {
      return actor.names.CS ||
             actor.names.cn ||
             Object.values(actor.names)[0] ||
             '未知';
    }
    return actor.names;
  }

  if (actor.name) {
    return actor.name;
  }

  if (actor.descriptions) {
    if (typeof actor.descriptions === 'object') {
      return actor.descriptions.CS ||
             actor.descriptions.cn ||
             Object.values(actor.descriptions)[0] ||
             '未知描述';
    }
    return actor.descriptions;
  }

  return '未知';
}

// 根据name_id查找actor中的对应名称
function getPetNameFromActor(nameId: string) {
  if (!itemData.value?.data?.actor || !nameId) {
    return '未知';
  }

  // 查找具有指定name_id的actor
  for (const actorId in itemData.value.data.actor) {
    const actor = itemData.value.data.actor[actorId];
    if (actor && actor.name_id === nameId) {
      // 优先返回中文名称
      if (actor.names) {
        if (typeof actor.names === 'object') {
          const chineseName = actor.names.CS || actor.names.cn;
          if (chineseName) return chineseName;

          for (const lang in actor.names) {
            if (actor.names[lang]) return actor.names[lang];
          }
        } else {
          return actor.names;
        }
      } else if (actor.name) {
        return actor.name;
      } else if (actor.descriptions) {
        if (typeof actor.descriptions === 'object') {
          return actor.descriptions.CS ||
                 actor.descriptions.cn ||
                 Object.values(actor.descriptions)[0] ||
                 `描述(${nameId})`;
        }
        return `${actor.descriptions} (描述)`;
      }
      return `Actor ${actorId}`;
    }
  }

  return `未知(${nameId})`;
}

// 根据tid获取宠物的actor名称
function getPetActorName(tid: number) {
  if (!itemData.value?.data?.pet) {
    return '未知';
  }

  const tidStr = String(tid);
  const pet = itemData.value.data.pet[tidStr];

  if (pet && pet.name_id) {
    return getPetNameFromActor(pet.name_id);
  }

  return '未知';
}

// 记录宠物相关数据
function logPetData() {
  setTimeout(() => {
    if (!itemData.value?.data?.actor || !itemData.value?.data?.pet) {
      return;
    }

    petData.value.forEach(pet => {
      const tidStr = String(pet.tid);
      const nameId = itemData.value.data.pet[tidStr]?.name_id;

      if (!nameId) return;

      // 查找匹配的actor
      const foundActor = findActorByNameId(nameId);

      if (foundActor) {
        // 省略后续处理...
      }
    });
  }, 1000);
}

// 检查actor数据是否存在
function checkAndLoadActorData() {
  if (!itemData.value?.data?.actor) {
    // 强制重新获取数据
    fetchAndStoreCsPackageData().then(data => {
      if (data) {
        itemData.value = data;
        if (itemData.value?.data?.actor) {
          displayActorData();
        } else {
          console.error('重新加载后仍未找到actor数据，请检查数据包完整性');
        }
      }
    }).catch(error => {
      console.error('重新加载数据包失败:', error);
    });
  } else {
    displayActorData();
  }
}

// 显示actor数据
function displayActorData() {
  if (!itemData.value?.data?.actor) {
    return;
  }
  // 功能保留，实现简化
}

// 匹配宠物与Actor
function matchPetsWithActors() {
  if (!itemData.value?.data?.pet || !itemData.value?.data?.actor) {
    return;
  }

  const petItems = itemData.value.data.pet;
  const actorData = itemData.value.data.actor;

  for (const petId in petItems) {
    const pet = petItems[petId];
    if (pet && pet.name_id) {
      let found = false;

      for (const actorId in actorData) {
        const actor = actorData[actorId];
        if (actor && actor.name_id === pet.name_id) {
          found = true;
          break;
        }
      }
    }
  }
}

// 处理并显示IndexedDB中的宠物数据
function displayPetDataFromIndexedDB() {
  if (itemData.value?.data?.pet) {
    // 比较宠物TID和IndexedDB中的ID
    comparePetIdWithTid();
  }
}

// 比较宠物TID和IndexedDB中的ID
function comparePetIdWithTid() {
  if (!itemData.value?.data?.pet || petData.value.length === 0) return;

  const petItems = itemData.value.data.pet;
  petData.value.forEach(pet => {
    const tid = String(pet.tid);
    // 简化后续处理...
  });
}

// 查找并打印特定TID的宠物name_id
function printPetNameId(tid: number) {
  if (!itemData.value?.data?.pet) {
    return;
  }

  const tidStr = String(tid);
  const pet = itemData.value.data.pet[tidStr];
  // 简化后续处理...
}

// 获取物品信息
async function getItemInfo(roleId: string) {
  if (!roleId) {
    window.$message?.error('角色ID为空，无法获取物品信息');
    return;
  }

  itemInfoLoading.value = true;
  try {
    const response = await fetchGetItemInfo({ roleId });
    if (!response) {
      inventoryItems.value = [];
      equipItems.value = [];
      return;
    }

    // 获取物品数据
    const inventoryData = response.data?.data?.[0]?.proto_data?.characterInventory?.listItemIuid ||
                        response.response?.data?.data?.[0]?.proto_data?.characterInventory?.listItemIuid || [];

    const equipData = response.data?.data?.[0]?.proto_data?.listEquipIuid ||
                     response.response?.data?.data?.[0]?.proto_data?.listEquipIuid || [];

    // 确保物品基础数据已加载
    if (!itemData.value) {
      // await fetchItemData();
    }

    // 处理背包物品
    inventoryItems.value = processItemData(inventoryData);

    // 处理装备物品
    equipItems.value = processEquipData(equipData);
  } catch (error) {
    console.error('获取物品数据失败:', error);
    window.$message?.error('获取物品数据失败');
    inventoryItems.value = [];
    equipItems.value = [];
  } finally {
    itemInfoLoading.value = false;
  }
}

// 处理物品数据
function processItemData(itemList: any[]) {
  return itemList.map((item: any) => {
    // 尝试从 itemData 中查找物品名称
    let itemName = `物品 ${item.id}`;

    if (item.id && itemData.value?.data?.item) {
      const itemInfo = itemData.value.data.item[item.id];
      if (itemInfo) {
        if (typeof itemInfo.names === 'object') {
          // 优先获取中文名称
          itemName = itemInfo.names.CS ||
                    itemInfo.names.cn ||
                    Object.values(itemInfo.names)[0] ||
                    itemName;
        } else if (itemInfo.name) {
          itemName = itemInfo.name;
        } else if (itemInfo.names) {
          itemName = itemInfo.names;
        }
      }
    }

    return {
      id: item.id || 0,
      name: itemName,
      guid: item.guid || ''
    };
  });
}

// 处理装备数据
function processEquipData(equipList: any[]) {
  return equipList.map((item: any) => {
    // 对于 id 为 null 的装备项，显示为 "空槽位"
    if (item.id === null) {
      return {
        id: 0,
        name: "空槽位",
        guid: item.guid || ''
      };
    }

    // 尝试从 itemData 中查找物品名称
    let itemName = `装备 ${item.id}`;

    if (item.id && itemData.value?.data?.item) {
      const itemInfo = itemData.value.data.item[item.id];
      if (itemInfo) {
        if (typeof itemInfo.names === 'object') {
          // 优先获取中文名称
          itemName = itemInfo.names.CS ||
                    itemInfo.names.cn ||
                    Object.values(itemInfo.names)[0] ||
                    itemName;
        } else if (itemInfo.name) {
          itemName = itemInfo.name;
        } else if (itemInfo.names) {
          itemName = itemInfo.names;
        }
      }
    }

    return {
      id: item.id || 0,
      name: itemName,
      guid: item.guid || ''
    };
  });
}

// 获取职业信息
async function getProfessionInfo(roleId: string) {
  if (!roleId) {
    window.$message?.error('角色ID为空，无法获取职业信息');
    return;
  }

  professionDataLoading.value = true;
  try {
    const response = await fetchGetProfessionInfo({ roleId });
    if (!response?.data) {
      professionData.value = [];
      return;
    }

    // 处理不同格式的职业数据响应
    if (Array.isArray(response.data) && response.data.length > 0) {
      const firstItem = response.data[0];
      professionData.value = firstItem.proto_data?.listProfesion || [];
    } else if (typeof response.data === 'object' && response.data.proto_data) {
      professionData.value = response.data.proto_data.listProfesion || [];
    } else {
      professionData.value = [];
    }
  } catch (error) {
    window.$message?.error('获取职业数据失败');
    professionData.value = [];
  } finally {
    professionDataLoading.value = false;
  }
}

// 获取技能信息
async function getSkillInfo(roleId: string) {
  if (!roleId) {
    window.$message?.error('角色ID为空，无法获取技能信息');
    return;
  }

  skillDataLoading.value = true;
  try {
    const response = await fetchGetSKillInfo({ roleId });
    if (!response?.data?.skillBook?.listSkill) {
      skillData.value = [];
      return;
    }

    // 提取技能基本信息
    const skillList = response.data.skillBook.listSkill.map((skill: any) => ({
      id: skill.id || 0,
      level: skill.level || 1,
      name: `${skill.id}` // 临时名称，后续会更新
    }));

    // 如果有技能，获取技能名称
    if (skillList.length > 0) {
      await updateSkillNames(skillList);
    }

    skillData.value = skillList;
  } catch (error) {
    console.error('获取技能数据失败:', error);
    window.$message?.error('获取技能数据失败');
    skillData.value = [];
  } finally {
    skillDataLoading.value = false;
  }
}

// 更新技能名称
async function updateSkillNames(skillList: SkillInfo[]) {
  try {
    // 为每个技能创建ID（格式：ID + 两位补0的level）
    const skillIds: string[] = skillList.map((skill: SkillInfo) => {
      const levelStr = skill.level.toString().padStart(2, '0');
      return `${skill.id}${levelStr}`;
    });

    // 准备查询参数
    const params = new URLSearchParams();
    skillIds.forEach((id: string) => params.append('ids', id));
    params.append('language', 'CS');

    // 获取技能名称
    const nameResponse = await fetchGetSKillName(params);
    const nameMap = nameResponse?.response?.data || {};

    // 更新技能名称
    skillList.forEach((skill: SkillInfo) => {
      const levelStr = skill.level.toString().padStart(2, '0');
      const fullId = `${skill.id}${levelStr}`;

      if (nameMap && typeof nameMap === 'object' && fullId in nameMap) {
        skill.name = (nameMap as any)[fullId]?.name || `技能${skill.id}`;
      } else {
        skill.name = `技能${skill.id}`;
      }
    });
  } catch (e) {
    console.error('获取技能名称失败:', e);
  }
}

// 获取载具信息
async function getVehicleInfo(roleId: string) {
  if (!roleId) {
    window.$message?.error('角色ID为空，无法获取载具信息');
    return;
  }

  vehicleDataLoading.value = true;
  try {
    const response = await fetchGetVehicleInfo({ roleId });
    if (!response?.data) return;

    vehicleData.value = response.data;

    // 更新当前使用的载具信息到角色信息
    const currentVehicle = response.data.list_vehicle.find(
      (v: VehicleInfo) => v.tid === response.data.cur_vehicle
    );

    if (currentVehicle) {
      roleInfo.value.level = currentVehicle.level;
      roleInfo.value.exp = currentVehicle.exp;
      roleInfo.value.power = currentVehicle.satiety;
    }
  } catch (error) {
    console.error('获取载具数据失败:', error);
    window.$message?.error('获取载具数据失败');
  } finally {
    vehicleDataLoading.value = false;
  }
}

// 获取任务数据
const getQuestData = async () => {
  questDataLoading.value = true;
  achieveDataLoading.value = true;

  try {
    const roleId = route.query.roleId as string;
    if (!roleId) {
      window.$message?.error('角色ID为空，无法获取任务信息');
      return;
    }

    const response = await fetchGetQuestInfo({ roleId });
    const questBook = response?.data?.quest_data?.questBook;

    // 处理任务列表
    if (questBook?.listQuest?.length) {
      await processQuestData(questBook.listQuest);
    } else {
      questData.value = [];
    }

    // 处理任务历史
    if (questBook?.history?.data?.length) {
      await getQuestHistoryData(questBook.history.data);
    } else {
      questHistoryData.value = [];
    }

    // 处理成就数据
    achieveData.value = (questBook?.listAchieve || []).map((achieve: any) => ({
      gid: achieve.gid,
      index: achieve.index,
      value: achieve.value
    }));
  } catch (error) {
    console.error('获取任务数据失败:', error);
    window.$message?.error('获取任务数据失败');
    questData.value = [];
    achieveData.value = [];
    questHistoryData.value = [];
  } finally {
    questDataLoading.value = false;
    achieveDataLoading.value = false;
  }
};

// 处理任务数据
async function processQuestData(questList: any[]) {
  try {
    // 提取任务ID
    const questIds = questList.map((quest: any) => quest.id);

    // 准备查询参数
    const params = new URLSearchParams();
    questIds.forEach((id: number) => params.append('ids', id.toString()));
    params.append('language', 'CS');

    // 获取任务名称
    const nameResponse = await fetchGetQuestName(params);
    const nameMap = nameResponse?.response?.data || {};

    // 处理任务数据
    questData.value = questList.map((quest: any) => {
      const questId = String(quest.id || 0);
      const questName = nameMap && typeof nameMap === 'object' && questId in nameMap
        ? (nameMap as any)[questId]?.name
        : `任务 ${quest.id}`;

      const questDescription = nameMap && typeof nameMap === 'object' && questId in nameMap
        ? (nameMap as any)[questId]?.description
        : (quest.sDescriptionId ? ` ${quest.sDescriptionId}` : '');

      return {
        id: quest.id || 0,
        name: questName,
        count: quest.values?.[0] || 0,
        state: questStateMap[quest.state as keyof typeof questStateMap] || '未知状态',
        description: questDescription,
        objectValue: quest.sObjectValue || 0,
        mapId: quest.sObjectMapid || 0,
        positionId: quest.sObjectPositionid || 0
      };
    });
  } catch (error) {
    console.error('处理任务数据失败:', error);
    questData.value = [];
  }
}

// 获取任务历史数据
const getQuestHistoryData = async (historyQuestIds: number[] = []) => {
  questHistoryDataLoading.value = true;

  try {
    if (historyQuestIds.length > 0) {
      // 准备查询参数
      const params = new URLSearchParams();
      historyQuestIds.forEach((id: number) => params.append('ids', id.toString()));
      params.append('language', 'CS');

      // 获取任务名称
      const nameResponse = await fetchGetQuestName(params);
      const nameMap = nameResponse?.response?.data || {};

      // 处理任务历史数据
      const historyItems = historyQuestIds.map((id: number) => {
        const questId = String(id);
        const questName = nameMap && typeof nameMap === 'object' && questId in nameMap
          ? (nameMap as any)[questId]?.name
          : `任务 ${id}`;

        const questReward = nameMap && typeof nameMap === 'object' && questId in nameMap
          ? (nameMap as any)[questId]?.reward
          : "-";

        return {
          id,
          name: questName,
          completedDate: "", // 补充空值以兼容接口定义
          reward: questReward
        };
      });

      questHistoryData.value = historyItems;
    } else {
      questHistoryData.value = [];
    }
  } catch (error) {
    console.error('获取任务历史数据失败:', error);
    window.$message?.error('获取任务历史数据失败');
    questHistoryData.value = [];
  } finally {
    questHistoryDataLoading.value = false;
  }
};

</script>

<template>
  <div
    class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto"
  >
    <NTabs type="line" animated v-model:value="activeTab" @update:value="handleTabChange">
      <NTabPane name="all-users" tab="Base info">
        <div class="flex flex-wrap gap-5">
          <!-- 左侧玩家信息卡片 -->
          <NCard class="w-[520px]" :bordered="false">
            <template #header>
              <div class="flex justify-between items-center">
                <!-- <span class="status-tag offline">{{ $t('common.maintenance') }}</span> -->
                <span class="status-tag offline">Offline</span>
              </div>
            </template>
            <!-- 玩家信息内容 -->
            <div class="flex flex-col">
              <div class="text-center mb-4">
                <h2 class="text-xl font-bold">{{ roleInfo.name }}</h2>
                <p class="text-gray-500">{{ roleInfo.class}}</p>
              </div>

              <div class="grid grid-cols-3 text-center gap-4 mb-5">
                <div class="level-box flex flex-col items-center">
                  <div class="value">{{ roleInfo.level }}</div>
                  <div class="label">Level</div>
                </div>
                <div class="exp-box flex flex-col items-center">
                  <div class="value">{{ roleInfo.exp }}</div>
                  <div class="label">Exp</div>
                </div>
                <div class="power-box flex flex-col items-center">
                  <div class="value">{{ roleInfo.power }}</div>
                  <div class="label">Power</div>
                </div>
              </div>
            </div>
          </NCard>

          <!-- 右侧状态信息卡片 -->
          <div class="flex flex-col gap-5 flex-1">
            <NCard :bordered="false" title="Stats">
              <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col">
                  <div class="stat-label">HP</div>
                  <div class="stat-value">{{ roleInfo.hp }}</div>
                </div>
                <div class="flex flex-col">
                  <div class="stat-label">MP</div>
                  <div class="stat-value">{{ roleInfo.mp }}</div>
                </div>
              </div>
            </NCard>

            <NCard :bordered="false" title="Position">
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="flex flex-col">
                  <div class="pos-label">Map Name</div>
                  <div class="pos-value">{{ roleInfo.position.mapName }}</div>
                </div>
                <div class="flex flex-col">
                  <div class="pos-label">Map ID</div>
                  <div class="pos-value">{{ roleInfo.position.mapId }}</div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="flex flex-col">
                  <div class="pos-label">X</div>
                  <div class="pos-value">{{ roleInfo.position.x }}</div>
                </div>
                <div class="flex flex-col">
                  <div class="pos-label">Y</div>
                  <div class="pos-value">{{ roleInfo.position.y }}</div>
                </div>
                <div class="flex flex-col">
                  <div class="pos-label">Z</div>
                  <div class="pos-value">{{ roleInfo.position.z }}</div>
                </div>
              </div>
            </NCard>
          </div>
        </div>
      </NTabPane>

      <NTabPane name="online-users" tab="item">
        <div class="flex flex-col gap-6 items-container">
          <!-- 背包物品表格 -->
          <NCard title="items" :bordered="false">
            <NDataTable
              :columns="[
                { key: 'id', title: 'ID', align: 'center', width: 100 },
                { key: 'name', title: 'names', align: 'center' },
                { key: 'guid', title: 'GUID', align: 'center', width: 200 },
              ]"
              :data="inventoryItems"
              :loading="itemInfoLoading"
              :pagination="{
                pageSize: 10,
                showSizePicker: false,
                showQuickJumper: false
              }"
              :row-key="row => row.guid || row.id"
              :max-height="500"
              size="medium"
            />
          </NCard>

          <!-- 装备物品表格 -->
          <NCard title="Equip" :bordered="false">
            <NDataTable
              :columns="[
                { key: 'id', title: 'ID', align: 'center', width: 100 },
                { key: 'name', title: 'names', align: 'center' },
                { key: 'guid', title: 'GUID', align: 'center', width: 200 },
              ]"
              :data="equipItems"
              :loading="itemInfoLoading"
              :pagination="{
                pageSize: 10,
                showSizePicker: false,
                showQuickJumper: false
              }"
              :row-key="row => row.guid || row.id"
              :max-height="500"
              size="medium"
            />
          </NCard>
        </div>
      </NTabPane>

      <NTabPane name="pet" tab="pet">
        <NCard title="Pets" :bordered="false">
        <NDataTable
          :columns="[
            { key: 'tid', title: 'TID', align: 'center', width: 100 },
            { key: 'name', title: 'Name', align: 'center', width: 120 },
            { key: 'level', title: 'Level', align: 'center', width: 120 },
            { key: 'satiety', title: 'Satiety', align: 'center', width: 120 },
          ]"
          :data="petData"
          :loading="petDataLoading"
          :pagination="mobilePagination"
          :row-key="row => row.tid"
        />
        </NCard>
      </NTabPane>

      <NTabPane name="profession" tab="profession">
        <NCard title="Profession" :bordered="false">
        <NDataTable
          :columns="[
            { key: 'grade', title: 'Grade', align: 'center', width: 100 },
            { key: 'type', title: 'Type', align: 'center', width: 120 },
            { key: 'level', title: 'level', align: 'center', width: 120 },
          ]"
          :data="professionData"
          :loading="professionDataLoading"
          :pagination="mobilePagination"
          :row-key="row => `${row.type || 0}-${row.grade}`"
        />
        </NCard>
      </NTabPane>

      <NTabPane name="quests" tab="quests">
        <div class="flex flex-col gap-6 quest-container">
          <NCard title="Quests" :bordered="false">
            <NDataTable
              :columns="[
                { key: 'id', title: 'ID', align: 'center', width: 100 },
                { key: 'name', title: 'Name', align: 'center', width: 200 },
                { key: 'count', title: 'Count', align: 'center', width: 100 },
                { key: 'state', title: 'State', align: 'center', width: 100 },
                { key: 'description', title: 'Description', align: 'center', width: 200 },
                { key: 'mapId', title: 'Map ID', align: 'center', width: 100 },
                { key: 'positionId', title: 'Position ID', align: 'center', width: 100 }
              ]"
              :data="questData"
              :loading="questDataLoading"
              :pagination="mobilePagination"
              :row-key="row => row.id"
            />
          </NCard>

          <!-- 任务历史 -->
          <NCard title="History" :bordered="false">
            <NDataTable
              :columns="[
                { key: 'id', title: 'ID', align: 'center', width: 100 },
                { key: 'name', title: 'Name', align: 'center', width: 200 },
              ]"
              :data="questHistoryData"
              :loading="questHistoryDataLoading"
              :pagination="mobilePagination"
              :row-key="row => row.id"
            />
          </NCard>

          <!-- 每日任务 -->
          <NCard title="Achieves" :bordered="false">
            <NDataTable
              :columns="[
                { key: 'gid', title: 'GID', align: 'center', width: 100 },
                { key: 'index', title: 'Index', align: 'center', width: 100 },
                { key: 'value', title: 'Value', align: 'center', width: 200 },
              ]"
              :data="achieveData"
              :loading="achieveDataLoading"
              :pagination="mobilePagination"
              :row-key="row => `${row.gid}-${row.index}`"
            />
          </NCard>
        </div>
      </NTabPane>

      <NTabPane name="Skill" tab="Skill">
        <NCard title="Skills" :bordered="false">
        <NDataTable
          :columns="[
            { key: 'id', title: 'ID', align: 'center', width: 100 },
            { key: 'name', title: 'Name', align: 'center', width: 120 },
            { key: 'level', title: 'Level', align: 'center', width: 80 },
          ]"
          :data="skillData"
          :loading="skillDataLoading"
          :pagination="mobilePagination"
          :row-key="row => row.id"
        />
        </NCard>
      </NTabPane>

      <NTabPane name="Vehicle" tab="Vehicle">
        <NCard title="Vehicles" :bordered="false">
        <NDataTable
          :columns="[
            { key: 'tid', title: 'TID', align: 'center', width: 100 },
            { key: 'level', title: 'Level', align: 'center', width: 120 },
            { key: 'exp', title: 'Exp', align: 'center', width: 120 },
            { key: 'satiety', title: 'Satiety', align: 'center', width: 120 },
            { key: 'end_date', title: 'End Date', align: 'center', width: 150 },
          ]"
          :data="vehicleData.list_vehicle"
          :loading="vehicleDataLoading"
          :pagination="mobilePagination"
          :row-key="row => row.tid"
        />
        </NCard>
      </NTabPane>

    </NTabs>
  </div>

</template>

<style scoped>
/* 标签页样式 */
:deep(.n-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.n-tabs-tab) {
  padding: 0 20px;
  font-size: 14px;
}

:deep(.n-tabs-tab.n-tabs-tab--active) {
  font-weight: bold;
}

:deep(.n-tabs-nav__line) {
  background-color: var(--primary-color);
}

/* 表格样式 */
:deep(.n-data-table-th) {
  background-color: rgba(240, 240, 240, 0.1);
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.offline {
  background-color: #333333;
  color: #eeeeee;
}

/* 数值显示样式 */
.value {
  font-size: 22px;
  font-weight: bold;
}

.label {
  font-size: 12px;
  color: #999999;
}

/* 状态数值 */
.stat-label, .pos-label {
  font-size: 14px;
  color: #999999;
  margin-bottom: 4px;
}

.stat-value, .pos-value {
  font-size: 18px;
  font-weight: bold;
}


:deep(.n-progress-icon) {
  font-size: 14px;
}

:deep(.n-progress-text) {
  font-size: 12px;
}

:deep(.n-progress-graph-line-fill) {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 任务容器样式 */
.quest-container {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 16px;
  padding-bottom: 30px; /* 添加底部间距，确保完全显示 */
}

.quest-container::-webkit-scrollbar {
  width: 8px; /* 增加宽度，便于拖动 */
}

.quest-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.quest-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.quest-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 物品容器样式 */
.items-container {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 16px;
  padding-bottom: 30px; /* 添加底部间距，确保完全显示 */
}

.items-container::-webkit-scrollbar {
  width: 8px; /* 增加宽度，便于拖动 */
}

.items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.items-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.items-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 添加表格内容溢出处理 */
:deep(.n-data-table-td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 添加分页器样式 */
:deep(.n-pagination) {
  padding: 16px 0;
  justify-content: center;
}
</style>

