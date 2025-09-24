import { request } from '../request';
import JSONbig from 'json-bigint';


// export function fetchGetgmuserlist(params?: { current: number; size: number; channelId?: string }) {
//   return request({
//     url: '/platform-user/record/list',
//     method: 'get',
//     params
//   });
// }

export function fetchGetgmuserlist(params?: { current: number; size: number; channelId?: string }) {
  return request({
    url: '/platform-user/record/list',
    method: 'get',
    params,
    transformResponse: [function (data) {
      try {
        return JSONbig.parse(data);
      } catch {
        return data;
      }
    }]
  });
}

// export function fetchGetgmrolelist(params?: { current: number; size: number; channelId?: string }) {
//   return request({
//     url: '/platform-user/role/roleList',
//     method: 'get',
//     params
//   });
// }

export async function fetchGetgmrolelist(params?: { current: number; size: number; channelId?: string }) {
  const res = await request({
    url: '/platform-user/role/roleList',
    method: 'get',
    params,
    transformResponse: [function (data) {
      try {
        return JSONbig.parse(data);
      } catch {
        return data;
      }
    }]
  });
  return res;
}

export function fetchBanUser(params: { userId: string; keepTime: number; banReason: string, action: string }) {
  return request({
    url: '/platform-game/user/gm/banOrUnban',
    method: 'post',
    params
  });
}


export function fetchchatuser(params: { userId: string; keepTime: number; chatReason: string }) {
  return request({
    url: '/platform-game/user/gm/chatOrUnchat',
    method: 'post',
    params
  });
}



export function fetchBanrole(params: { roleId: string; keepTime: number; banReason: string, action: string }) {
  return request({
    url: '/platform-game/user/gm/roleBanOrUnban',
    method: 'post',
    params
  });
}

export function fetchchatrole(params: { roleId: string; keepTime: number; chatReason: string }) {
  return request({
    url: '/platform-game/user/gm/roleChatOrUnchat',
    method: 'post',
    params
  });
}

// gm测试接口
export function fetchGmTest(params: { type: string; data: string }) {
  return request({
    url: '/platform-game/gm/custom',
    method: 'post',
    params
  });
}

// 踢出下线用户接口
export function fetchKickUser(params: { userId: string }) {
  return request({
    url: '/platform-game/user/gm/kickUser',
    method: 'post',
    params
  });
}

// 踢出下线角色接口
export function fetchKickRole(params: { roleId: string }) {
  return request({
    url: '/platform-game/user/gm/kickRole',
    method: 'post',
    params
  });
}

// 踢出服务器接口
export function fetchKickServer(params: { serverId: string }) {
  return request({
    url: '/platform-game/user/gm/kickAll',
    method: 'post',
    params
  });
}

