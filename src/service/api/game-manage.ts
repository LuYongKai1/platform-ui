import { log } from 'console';
import { request } from '../request';
import exp from 'constants';
import JSONbig from 'json-bigint';

// 游戏管理游戏列表
export function fetchGetGameList(data: any) {
  return request({
    url: '/platform-game/game/list',
    method: 'get',
    data
  });
}

// 删除游戏列表
export function fetchDeleteGameList(params: { gameId: number }) {
  return request({
    url: `/platform-game/game/${params.gameId}`,
    method: 'delete'
  });
}

// 新增游戏
export function fetchAddGame(data: any) {
  return request({
    url: '/platform-game/game',
    method: 'post',
    data
  });
}

// 修改游戏
export function fetchUpdateGame(data: any) {
  return request({
    url: '/platform-game/game',
    method: 'put',
    data
  });
}

//获取渠道列表
export function fetchGetChannelList() {
  return request({
    url: '/platform-game/channel/select',
    method: 'get'
  });
}

// 获取渠道列表
export function fetchGetChannel(params?: Api.SystemManage.channeSearchParams) {
  return request<Api.SystemManage.channelList>({
    url: '/platform-game/channel/list',
    method: 'get',
    params
  });
}

// 渠道管理新增渠道
export function fetchAddChannel(data: any) {
  return request({
    url: '/platform-game/channel',
    method: 'post',
    data
  });
}

// 删除渠道
export function fetchDeleteChannelList(params: { channelId: number }) {
  return request({
    url: `/platform-game/channel/${params.channelId}`,
    method: 'delete'
  });
}

// 修改渠道
export function fetchUpdateChannel(data: any) {
  return request({
    url: '/platform-game/channel',
    method: 'put',
    data
  });
}


// 获取服务器专区列表
export function fetchGetServer(params?: { current: number; size: number; }) {
  return request<Api.SystemManage.serverregion>({
    url: '/platform-game/region/list',
    method: 'get',
    params
  });
}

// 添加服务器专区
export function fetchAddServerregion(data: any) {
  return request({
    url: '/platform-game/region',
    method: 'post',
    data
  });
}
// 修改服务器专区
export function fetchUpdateServerregion(data: any) {
  return request({
    url: '/platform-game/region',
    method: 'put',
    data
  });
}
// 删除服务器专区
export function fetchDeleteServerregion(params: { id: number }) {
  return request({
    url: `/platform-game/region/${params.id}`,
    method: 'delete'
  });
}

//获取白名单
export function fetchGetWhiteList() {
  return request({
    url: '/platform-game/white/list',
    method: 'get',
  });
}

/*获取服务器分组*/
export function fetchGetServerGroup(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-game/group/list',
    method: 'get',
    params
  });
}

/*添加服务器分组*/
export function fetchAddServerGroup(data: any) {
  return request({
    url: '/platform-game/group',
    method: 'post',
    data
  });
}

// 修改服务器分组
export function fetchUpdateServerGroup(data: any) {
  return request({
    url: '/platform-game/group',
    method: 'put',
    data
  });
}

// 删除服务器分组
export function fetchDeleteServerGroup(params: { id: number }) {
  return request({
    url: `/platform-game/group/${params.id}`,
    method: 'delete'
  });
}


// 日志服务管理log
export function fetchGetServerlog() {
  return request({
    url: '/platform-game/log/list',
    method: 'get',
  });
}

// 添加日志服务管理log
export function fetGetServerAdd(data: any) {
  return request({
    url: '/platform-game/log',
    method: 'post',
    data
  })
}

// 修改日志服务管理log
export function fetchGetServerUpdate(data: any) {
  return request({
    url: '/platform-game/log',
    method: 'put',
    data
  })
}

// 删除日志服务管理log
export function fetchGetServerDelete(params: { id: number }) {
  return request({
    url: `/platform-game/log/${params.id}`,
    method: 'delete'
  })
}

// 服务器列表
export function fetchGetServeritemList(params?: { current: number; size: number; groupId?: string }) {
  return request({
    url: '/platform-game/item/list',
    method: 'get',
    params
  });
}

// 添加服务器列表
export function fetchGetServeritemAdd(data: any) {
  return request({
    url: '/platform-game/item',
    method: 'post',
    data
  })
}

export function fetchGetServeritemUpdate(data: any) {
  return request({
    url: '/platform-game/item',
    method: 'put',
    data
  })
}

export function fetchGetServeritemDelete(params: { id: number }) {
  return request({
    url: `/platform-game/item/${params.id}`,
    method: 'delete'
  })
}



// 白名单管理
export function fetchGetWhiteListManage(params?: { current: number; size: number; channelId?: string }) {
  return request({
    url: '/platform-game/white/list',
    method: 'get',
    params
  });
}

// 添加白名单
export function fetchAddWhiteListManage(data: any) {
  return request({
    url: '/platform-game/white',
    method: 'post',
    data
  })
}

// 修改白名单
export function fetchUpdateWhiteListManage(data: any) {
  return request({
    url: '/platform-game/white',
    method: 'put',
    data
  })
}

// 删除白名单
export function fetchDeleteWhiteListManage(params: { id: number }) {
  return request({
    url: `/platform-game/white/${params.id}`,
    method: 'delete'
  })
}

//获取server_id
export function fetchGetServerId() {
  return request({
    url: 'platform-game/region/servers',
    method: 'get',
  });
}

// 获取服务器列表树结构
export function fetchGetServerList() {
  return request({
    url: '/platform-game/group/itemsByGroup',
    method: 'get',
  });
}


// 获取用户白名单列表
export function fetchGetUserWhiteList(params?: { current: number; size: number; type?: string; }) {
  return request({
    url: '/platform-user/white/list',
    method: 'get',
    params
  });
}

//添加白名单
export function fetchAddUserWhiteList(data: any) {
  return request({
    url: '/platform-user/white/add',
    method: 'post',
    data
  })
}

// 删除白名单
export function fetchDeleteUserWhiteList(params: { id: number }) {
  return request({
    url: `/platform-user/white/${params.id}`,
    method: 'delete'
  })
}

// 修改白名单
export function fetchUpdateUserWhiteList(data: any) {
  return request({
    url: 'platform-user/white/edit',
    method: 'put',
    data
  })
}

// 排队设置接口
export function fetchQueuePlayerCount(data: { gameId: number; setto: number; serverList: number[] }) {
  return request({
    url: '/platform-game/server/queuePlayerCount',
    method: 'post',
    data
  })
}

//维护设置
export function fetchGetMaintenanceSetting(serverIds: number[]) {
  return request({
    url: '/platform-game/item/maintenance',
    method: 'post',
    data: serverIds
  });
}

// 开启服务器接口
export function fetchStartServer(serverIds: number[]) {
  return request({
    url: '/platform-game/item/normalstate',
    method: 'post',
    data: serverIds
  });
}


// 同步GM地址
export function fetchgetServerInfo(params: { gmUrl: string }) {
  return request({
    url: `/platform-game/server/getServerInfo?gmUrl=${params.gmUrl}`,
    method: 'get'
  });
}

// 角色详情
export function fetchGetVehicleInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getVehicleInfo?cuid=${params.roleId}`,
    method: 'get',
  });
}


export function fetchGetclientRoleList(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getRole?cuid=${params.roleId}`,
    method: 'get',
  });
}

// client/getpetinfo
export function fetchGetPetInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getPetInfo?cuid=${params.roleId}`,
    method: 'get',
  });
}

//client/getProfessionInfo
export function fetchGetProfessionInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getProfessionInfo?cuid=${params.roleId}`,
    method: 'get',
  });
}

//client/getSkillInfo
export function fetchGetSKillInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getSkillInfo?cuid=${params.roleId}`,
    method: 'get',
  });
}

// client/getQuestInfo
export function fetchGetQuestInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getQuestInfo?cuid=${params.roleId}`,
    method: 'get',
  });
}
// client/getitem
export function fetchGetItemInfo(params: { roleId: number | string }) {
  return request({
    url: `/platform-user/client/getItem1?cuid=${params.roleId}`,
    method: 'get',
  });
}


// 跑马灯
export function fetchGetMarquee(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/marquee/list',
    method: 'get',
    params
  });
}

// 添加跑马灯
export function fetchAddMarquee(data: any) {
  return request({
    url: '/platform-operate/marquee',
    method: 'post',
    data
  });
}

// 更新跑马灯
export function fetchUpdateMarquee(data: any) {
  return request({
    url: '/platform-operate/marquee',
    method: 'put',
    data
  });
}

// 删除跑马灯
export function fetchDeleteMarquee(params: { id: number }) {
  return request({
    url: `/platform-operate/marquee/${params.id}`,
    method: 'delete'
  });
}

// 发送跑马灯
export function fetchSendMarquee(params: { id: number }) {
  return request({
    url: `/platform-operate/marquee/start?id=${params.id}`,
    method: 'post'
  });
}

// 模板管理
export function fetchPostTemplateList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activityTemplate/list',
    method: 'post',
    params,
    data: params
  });
}

// 获取模板
export function fetchGetTemplate() {
  return request({
    url: `/platform-operate/activityGM/list`,
    method: 'get',
  });
}

export function fetchGetTemplateAll() {
  return request({
    url: `/platform-operate/activityTemplate/getAll`,
    method: 'get',
  });
}

// 添加模板
export function fetchAddTemplate(data: any) {
  return request({
    url: '/platform-operate/activityTemplate/add',
    method: 'post',
    data
  });
}

// 修改模板
export function fetchUpdateTemplate(data: any) {
  return request({
    url: '/platform-operate/activityTemplate/edit',
    method: 'put',
    data
  });
}

// 删除模板
export function fetchDeleteTemplate(params: { id: number }) {
  return request({
    url: `/platform-operate/activityTemplate/remove/${params.id}`,
    method: 'delete'
  });
}

// 获取活动公告
export function fetchGetActivityNotice(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activity/list',
    method: 'post',
    params,
    data: params
  });
}

// 添加活动公告
export function fetchAddActivityNotice(data: any) {
  return request({
    url: '/platform-operate/activity/add',
    method: 'post',
    data
  });
}

// 修改活动模块
export function fetchUpdateActivityNotice(data: any) {
  return request({
    url: '/platform-operate/activity/edit',
    method: 'put',
    data
  });
}

// 删除活动模块
export function fetchDeleteActivityNotice(params: { id: number }) {
  return request({
    url: `/platform-operate/activity/remove/${params.id}`,
    method: 'delete'
  });
}

// 审核活动模块
export function fetchAuditActivityNotice(data: any) {
  return request({
    url: '/platform-operate/activity/audit',
    method: 'post',
    data
  });
}
// 启用停用
export function fetchEnableActivityNotice(data: any) {
  return request({
    url: '/platform-operate/activity/enable',
    method: 'post',
    data
  });
}
// 活动log
export function fetchGetActivityLog(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activityLog/list',
    method: 'post',
    params,
    data: params
  });
}

// 查看详情
export function fetchGetActivityLogDetail(params: { id: number }) {
  return request({
    url: `/platform-operate/activity/get/${params.id}`,
    method: 'get'
  });
}

// 参数配置列表
export function fetchGetActivityGMList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activityGM/list1',
    method: 'post',
    params,
    data: params
  });
}

// 新增gm配置
export function fetchAddActivityGM(data: any) {
  return request({
    url: '/platform-operate/activityGM/add',
    method: 'post',
    data
  });
}

// 修改gm配置
export function fetchUpdateActivityGM(data: any) {
  return request({
    url: '/platform-operate/activityGM/edit',
    method: 'put',
    data
  });
}

// 删除gm配置
export function fetchDeleteActivityGM(params: { id: number }) {
  return request({
    url: `/platform-operate/activityGM/remove/${params.id}`,
    method: 'delete'
  });
}

// 模板参数配置列表
export function fetchGetActivityGMParamsList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activityGMParam/list',
    method: 'post',
    params,
    data: params
  });
}

// 新增参数配置
export function fetchAddActivityGMParams(data: any) {
  return request({
    url: '/platform-operate/activityGMParam/add',
    method: 'post',
    data
  });
}

// 修改参数配置
export function fetchUpdateActivityGMParams(data: any) {
  return request({
    url: '/platform-operate/activityGMParam/edit',
    method: 'put',
    data
  });
}

// 删除参数配置
export function fetchDeleteActivityGMParams(params: { id: number }) {
  return request({
    url: `/platform-operate/activityGMParam/remove/${params.id}`,
    method: 'delete'
  });
}
// 获取模板列表
export function fetchGetActivityGM() {
  return request({
    url: '/platform-operate/activityGM/list',
    method: 'get',
  });
}

// 获取活动图片
export function fetchGetActivityImages(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/activityImage/list',
    method: 'post',
    params,
    data: params
  });
}

// 添加活动图片
export function fetchAddActivityImages(data: any) {
  return request({
    url: '/platform-operate/activityImage/add',
    method: 'post',
    data
  });
}

// 修改活动图片
export function fetchUpdateActivityImages(data: any) {
  return request({
    url: '/platform-operate/activityImage/edit',
    method: 'put',
    data
  });
}

// 删除活动图片
export function fetchDeleteActivityImages(params: { id: number }) {
  return request({
    url: `/platform-operate/activityImage/remove/${params.id}`,
    method: 'delete'
  });
}

// 获取维护公告
export function fetchGetMaintenanceNotice(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/maintenanceNotice/list',
    method: 'post',
    params,
    data: params
  });
}

// 添加维护公告
export function fetchAddMaintenanceNotice(data: any) {
  return request({
    url: '/platform-operate/maintenanceNotice',
    method: 'post',
    data
  });
}

// 修改维护公告
export function fetchUpdateMaintenanceNotice(data: any) {
  return request({
    url: '/platform-operate/maintenanceNotice',
    method: 'put',
    data
  });
}

// 删除维护公告
export function fetchDeleteMaintenanceNotice(params: { id: number }) {
  return request({
    url: `/platform-operate/maintenanceNotice/${params.id}`,
    method: 'delete'
  });
}

// 获取公会列表
export function fetchGetGuildList(params?: { serverId: number, current: number; size: number; }) {
  return request({
    url: `/platform-operate/operate/mail/guild/getGuildList`,
    method: 'get',
    params,
  });
}


// 获取公会邮件列表
export function fetchGetGuildMailList(params?: { current: number; size: number; }) {
  return request({
    url: `/platform-operate/operate/mail/guild/list`,
    method: 'get',
    params,
  });
}

// 获取公会邮件列表不带分页
export function fetchGetGuildMailListNoPage(params?: { serverId: number, current: number; size: number; }) {
  return request({
    url: `/platform-operate/operate/mail/guild/getGuidNoPage`,
    method: 'get',
    params,
  });
}

// 添加邮件公会
export function fetchAddGuildMail(data: any) {
  return request({
    url: `/platform-operate/operate/mail/guild/add`,
    method: 'post',
    data,
  });
}

// 修改公会邮件
export function fetchUpdateGuildMail(data: any) {
  return request({
    url: `/platform-operate/operate/mail/guild/edit`,
    method: 'put',
    data,
  });
}

// 发送公会邮件
export function fetchSendGuildMail(id: number) {
  return request({
    url: `/platform-operate/operate/mail/guild/start?id=${id}`,
    method: 'post',
  })
}

//停止发送公会邮件
export function fetchStopSendGuildMail(id: number) {
  return request({
    url: `/platform-operate/operate/mail/guild/stop?id=${id}`,
    method: 'post',
  })
}

// 删除公会邮件
export function fetchDeleteGuildMail(id: number) {
  return request({
    url: `/platform-operate/operate/mail/guild/remove/${id}`,
    method: 'delete',
  })
}

// 查询用户留存列表
export function fetchGetUserRetentionList(params?: { current: number; size: number; channelId?: string; dataType?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/retentionUser/list',
    method: 'get',
    params,
  });
}

// 查询角色用户留存列表
export function fetchGetRoleRetentionList(params?: { current: number; size: number; channelId?: string; dataType?: string; serverId?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/retentionRole/list',
    method: 'get',
    params
  });
}

// 支付留存
export function fetchGetPayRetentionList(params?: { current: number; size: number; channelId?: string; dataType?: string; beginTime?: string; }) {
  return request({
    url: '/platform-bi/retentionPayed/list',
    method: 'get',
    params
  });
}

// 角色概览接口
export function fetchGetRoleOverview(params?: { current: number; size: number; channelId?: string; dataType?: string; serverId?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/OverviewRole/overview/role',
    method: 'get',
    params
  });
}

// 用户概览接口
export function fetchGetUserOverview(params?: { current: number; size: number; channelId?: string; dataType?: string; serverId?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/OverviewUserDevice/user',
    method: 'get',
    params
  });
}

// 获取商品管理列表
export function fetchGetProductList(params?: { current: number; size: number; channelId?: string }) {
  return request({
    url: '/platform-game/gameProduct/list',
    method: 'get',
    params
  });
}

// 添加商品
export function fetchAddProduct(data: any) {
  return request({
    url: '/platform-game/gameProduct',
    method: 'post',
    data
  });
}

// 修改商品
export function fetchUpdateProduct(data: any) {
  return request({
    url: '/platform-game/gameProduct',
    method: 'put',
    data
  });
}

// 删除商品
export function fetchDeleteProduct(params: { id: number }) {
  return request({
    url: `/platform-game/gameProduct/${params.id}`,
    method: 'delete'
  });
}

// 导入商品
export function fetchImportProduct(data: any) {
  return request({
    url: '/platform-game/gameProduct/importCoverData',
    method: 'post',
    data
  });
}

// 导出商品
export function fetchExportProduct(params: { channelId: string }) {
  return request({
    url: '/platform-game/gameProduct/export',
    method: 'post',
    params,
    responseType: 'blob'
  });
}

// 下载模板
export function fetchDownloadTemplate(params: { channelId: string }) {
  return request({
    url: '/platform-game/gameProduct/downloadTemplate',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

// 获取元宝商城列表
export function fetchGemsShopList(params?: { current: number; size: number; channelId?: string }) {
  return request({
    url: '/platform-game/gemsShop/list',
    method: 'get',
    params
  });
}

// 添加元宝商城
export function fetchAddGemsShop(data: any) {
  return request({
    url: '/platform-game/gemsShop',
    method: 'post',
    data
  });
}

// 修改元宝商城
export function fetchUpdateGemsShop(data: any) {
  return request({
    url: '/platform-game/gemsShop',
    method: 'put',
    data
  });
}

// 导入元宝商城
export function fetchImportGemsShop(data: any) {
  return request({
    url: '/platform-game/gemsShop/import',
    method: 'post',
    data
  });
}

// 导出元宝商城
export function fetchExportGemsShop(data: { serverId?: string }) {
  return request({
    url: '/platform-game/gemsShop/export',
    method: 'get',
    data,
    responseType: 'blob'
  });
}

// 下载元宝商城模板
export function fetchDownloadGemsShopTemplate(params: { serverId?: string }) {
  return request({
    url: '/platform-game/gemsShop/downloadTemplate',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

// 删除元宝商城商品
export function fetchDeleteGemsShop(params: { id: number }) {
  return request({
    url: `/platform-game/gemsShop/${params.id}`,
    method: 'delete'
  });
}

// 同步元宝商城
export function fetchSyncGemsShop(serverIds: number[]) {
  return request({
    url: `/platform-game/gemsShop/syncFile/${serverIds}`,
    method: 'get'
  });
}

// 获取服务器文件列表
export function fetchServerFileList(params?: { path?: string; serverId?: string }) {
  return request({
    url: '/platform-operate/serverFile/file/list',
    method: 'get',
    params
  });
}

// 下载服务器文件
export function fetchDownloadServerFile(params?: { dir?: string; fileName?: string; serverId?: string }) {
  return request({
    url: '/platform-operate/serverFile/file/download',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

// 上传服务器文件
export function fetchUploadServerFile(data: any) {
  return request({
    url: '/platform-operate/serverFile/file/upload',
    method: 'post',
    data
  });
}

// 获取文件的哈希值
export function fetchGetFileHash(params?: { dir?: string; fileName?: string; serverId?: string }) {
  return request({
    url: '/platform-operate/serverFile/file/hash',
    method: 'get',
    params
  });
}

// 订单管理页
export function fetchGetOrderList(params?: {
  current: number;
  size: number;
  channelId?: string;
  serverId?: string;
  openId?: string;
  roleId?: string;
  itemId?: string;
  orderNo?: string;
  outOrderNo?: string;
  uid?: string;
  loginName?: string;
  status?: string;
  statusList?: string[];
  callbackStatus?: string;
}) {
  return request({
    url: '/platform-pay/order/quick/list',
    method: 'get',
    params,
    transformResponse: [
      function (data) {
        try {
          // 保留所有大整数为字符串
          return JSONbig({ storeAsString: true }).parse(data);
        } catch {
          return data;
        }
      }
    ]
  });
}

// 批量补单
export function fetchBatchRecharge(data: any) {
  return request({
    url: '/platform-pay/order/reissue/batch',
    method: 'post',
    data
  });
}


// 区服活动
export function fetchGetServerActivityList(params?: { current: number; size: number; serverId?: number; }) {
  return request({
    url: `/platform-operate/relay/activity/list`,
    method: 'get',
    params
  });
}

// export function fetchGetServerActivityList(params?: { current: number; size: number; serverId?: number; }) {
//   return request({
//     url: `/platform-operate/relay/activity/list`,
//     method: 'get',
//     params
//   });
// }


// 开启区服活动
export function fetchGetServerActivity(serverId: number, activityGuid: string) {
  return request({
    url: `/platform-operate/relay/activity/buildGmJson`,
    method: 'post',
    data: {
      serverId,
      activityGuid
    }
  });
}

// 控制活动开启关闭
export function fetchToggleServerActivity(data: {
  serverId: number;
  activityConfigId: number;
  tag: number;
}) {
  return request({
    url: `/platform-operate/relay/activity/buildGmJson`,
    method: 'post',
    data
  });
}

// 获取用户LTV
export function fetchGetUserLTV(params?: { current: number; size: number; channelId?: string; dataType?: string; serverId?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/bi/ltv/user',
    method: 'get',
    params
  });
}

// 付费LTV
export function fetchGetPayLTV(params?: { current: number; size: number; channelId?: string; dataType?: string; serverId?: string; ignoreTypes?: string; }) {
  return request({
    url: '/platform-bi/bi/ltv/payed',
    method: 'get',
    params
  });
}

// 获取服务器跨服列表
export function fetchGetServerCrossList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-game/serverCrossRelation/crossServerList',
    method: 'get',
    params
  });
}

// 获取跨服下的普通服列表
export function fetchGetServerCrossServerList(crossServerId: number) {
  return request({
    url: `/platform-game/serverCrossRelation/getNormalByCrossId/${crossServerId}`,
    method: 'get'
  });
}

// 批量分配跨服关联
export function fetchBatchAddServerCross(data: any) {
  return request({
    url: '/platform-game/serverCrossRelation/batchAdd',
    method: 'post',
    data
  });
}

// 同步跨服接口 (改为 POST)
export function fetchSyncServerCross(data: { gameId: number; crossServerId: number; serverIds: number[] }) {
  return request({
    url: '/platform-game/server/syncCrossServer',
    method: 'post',
    data
  });
}

// 获取问卷列表
export function fetchGetQuestionnaireList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/survey/list',
    method: 'get',
    params
  });
}

// 新增问卷列表
export function fetchAddQuestionnaire(data: any) {
  return request({
    url: '/platform-operate/survey',
    method: 'post',
    data
  });
}

// 修改问卷列表
export function fetchUpdateQuestionnaire(data: any) {
  return request({
    url: '/platform-operate/survey',
    method: 'put',
    data
  });
}

// 删除问卷列表
export function fetchDeleteQuestionnaire(params: { id: number }) {
  return request({
    url: `/platform-operate/survey/${params.id}`,
    method: 'delete'
  });
}

// 获取问卷记录
export function fetchGetQuestionnaireRecord(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/survey/answer/list',
    method: 'get',
    params,
    transformResponse: [
      function (data) {
        try {
          // 保留所有大整数为字符串
          return JSONbig({ storeAsString: true }).parse(data);
        } catch {
          return data;
        }
      }
    ]
  });
}

// 导出问卷记录
export function fetchExportQuestionnaireRecord() {
  return request({
    url: '/platform-operate/survey/export',
    method: 'get',
    responseType: 'blob'
  });
}

// 获取礼包活动列表
export function fetchGetGiftActivityList(params?: { current: number; size: number; }) {
  return request({
    url: '/platform-operate/gift/campaign/list',
    method: 'get',
    params
  });
}

// 新增礼包活动
export function fetchAddGiftActivity(data: any) {
  return request({
    url: '/platform-operate/gift/campaign',
    method: 'post',
    data
  });
}

// 修改礼包活动
export function fetchUpdateGiftActivity(data: any) {
  return request({
    url: '/platform-operate/gift/campaign',
    method: 'put',
    data
  });
}

// 删除礼包活动
export function fetchDeleteGiftActivity(params: { id: number }) {
  return request({
    url: `/platform-operate/gift/campaign/${params.id}`,
    method: 'delete'
  });
}

// 获取礼包批次列表
export function fetchGetGiftBatchList(params?: { current: number; size: number; campaignId?: number; }) {
  return request({
    url: '/platform-operate/giftCodeBatch/list',
    method: 'get',
    params
  });
}

// 创建专码批次
export function fetchAddGiftBatch(data: any) {
  return request({
    url: '/platform-operate/giftCodeBatch/unique/create',
    method: 'post',
    data
  });
}
// 创建通码批次
export function fetchAddGiftBatchPublic(data: any) {
  return request({
    url: '/platform-operate/giftCodeBatch/public/create',
    method: 'post',
    data
  });
}

// 修改礼包批次
export function fetchUpdateGiftBatch(data: any) {
  return request({
    url: '/platform-operate/giftCodeBatch',
    method: 'put',
    data
  });
}

// 作废礼包批次
export function fetchInvalidGiftBatch(params: { id: number }) {
  return request({
    url: `/platform-operate/giftCodeBatch/logic/${params.id}`,
    method: 'delete'
  });
}

// 生成兑换码
export function fetchGenerateGiftCodes(data: { batchId: number }) {
  return request({
    url: '/platform-operate/giftCodeBatch/generate',
    method: 'post',
    data
  });
}

// 查看兑换码
export function fetchGetGiftCodes(params: { batchId: number }) {
  return request({
    url: '/platform-operate/gift/code/list',
    method: 'get',
    params,
    transformResponse: [
      function (data) {
        try {
          return JSONbig({ storeAsString: true }).parse(data);
        } catch {
          return data;
        }
      }
    ]
  });
}

// 分配区服范围
export function fetchAssignServerRange(data: { campaignId: number, serverIds: string[] }) {
  return request({
    url: '/platform-operate/gift/campaignServer/add',
    method: 'post',
    data
  });
}


// 分配渠道范围
export function fetchAssignChannelRange(data: { campaignId: number, channelIds: string[] }) {
  return request({
    url: '/platform-operate/gift/campaignChannel/add',
    method: 'post',
    data
  });
}

// 按活动查询分配的渠道列表
export function fetchGetAssignChannelList(params: { campaignId: number }) {
  return request({
    url: `/platform-operate/gift/campaignChannel/list/${params.campaignId}`,
    method: 'get',
    params
  });
}

// 按活动查询分配的区服列表
export function fetchGetAssignServerList(params: { campaignId: number }) {
  return request({
    url: `/platform-operate/gift/campaignServer/list/${params.campaignId}`,
    method: 'get',
    params
  });
}

// 兑换记录
export function fetchGetGiftRecordList(params: {
  current: number;
  size: number;
  channelId?: number;
  channelName?: string;
  status?: number;
  openId?: string;
  serverId?: number;
}) {
  return request({
    url: '/platform-operate/gift/redeem/list',
    method: 'get',
    params,
    transformResponse: [
      function (data) {
        try {
          return JSONbig({ storeAsString: true }).parse(data);
        } catch {
          return data;
        }
      }
    ]
  });
}

// 导出兑换码
export function fetchExportGiftRecord(data: { batchId: number }) {
  return request({
    url: '/platform-operate/gift/redeem/export',
    method: 'post',
    data,
    responseType: 'blob'
  });
}

// 礼包码兑换码导出
export function fetchExportGiftCodes(data: { batchId: number }) {
  return request({
    url: '/platform-operate/gift/code/export',
    method: 'post',
    data,
    responseType: 'blob'
  });
}
