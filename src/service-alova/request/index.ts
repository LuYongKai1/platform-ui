import { createAlovaRequest } from '@sa/alova';
import { createAlovaMockAdapter } from '@sa/alova/mock';
import adapterFetch from '@sa/alova/fetch';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import { getServiceBaseURL } from '@/utils/service';
import { useRouterPush } from '@/hooks/common/router';
import featureUsers20241014 from '../mocks/feature-users-20241014';
import { getAuthorization, handleRefreshToken, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const state: RequestInstanceState = {
  errMsgStack: []
};

// 统一的弹窗防重复机制 (与 Axios 共享)
const globalDialogState = {
  isAccountKickedDialogShowing: false,
  lastDialogTime: 0,
  DIALOG_INTERVAL: 3000, // 3秒防重复间隔
  isProcessing: false // 添加处理中标志，防止并发
};

// 检查全局弹窗状态（兼容 Axios）
function getGlobalDialogState() {
  // 如果 window 上已有状态，使用它（可能是 Axios 设置的）
  if ((window as any)._globalAccountKickedState) {
    return (window as any)._globalAccountKickedState;
  }
  // 否则设置自己的状态并共享给全局
  (window as any)._globalAccountKickedState = globalDialogState;
  return globalDialogState;
}

const mockAdapter = createAlovaMockAdapter([featureUsers20241014], {
  // using requestAdapter if not match mock request
  httpAdapter: adapterFetch(),

  // response delay time
  delay: 1000,

  // global mock toggle
  enable: true,
  matchMode: 'methodurl'
});

// 统一的账号被踢处理函数
function handleAccountKicked(authStore: any) {
  const state = getGlobalDialogState();

  // 立即检查并设置处理状态，防止并发调用
  if (state.isProcessing || state.isAccountKickedDialogShowing) {
    return;
  }

  const now = Date.now();

  // 如果距离上次弹窗时间过短，则跳过
  if (now - state.lastDialogTime < state.DIALOG_INTERVAL) {
    return;
  }

  // 立即设置处理状态，防止其他并发调用
  state.isProcessing = true;
  state.isAccountKickedDialogShowing = true;
  state.lastDialogTime = now;

  function handleLogout() {
    authStore.resetStore();
  }

  function logoutAndCleanup() {
    handleLogout();
    window.removeEventListener('beforeunload', handleLogout);
    // 重置状态，允许下次显示（比如用户重新登录后）
    state.isAccountKickedDialogShowing = false;
    state.isProcessing = false;
  }

  const accountKickedOutMsg = $t('request.accountKickedOutMsg');

  // prevent the user from refreshing the page
  window.addEventListener('beforeunload', handleLogout);

  if (window.$dialog) {
    window.$dialog.error({
      title: $t('request.accountKickedOut'),
      content: accountKickedOutMsg,
      positiveText: $t('common.confirm'),
      maskClosable: false,
      closeOnEsc: false,
      onPositiveClick() {
        logoutAndCleanup();
      },
      onClose() {
        logoutAndCleanup();
      }
    });
  } else {
    alert(accountKickedOutMsg);
    handleLogout();
    state.isAccountKickedDialogShowing = false;
    state.isProcessing = false;
  }
}

export const alova = createAlovaRequest(
  {
    baseURL,
    requestAdapter: import.meta.env.DEV ? mockAdapter : adapterFetch()
  },
  {
    onRequest({ config }) {
      const Authorization = getAuthorization();
      config.headers.Authorization = Authorization;
      config.headers.apifoxToken = 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2';
    },
    tokenRefresher: {
      async isExpired(response) {
        const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
        const { code } = await response.clone().json();
        return expiredTokenCodes.includes(String(code));
      },
      async handler() {
        await handleRefreshToken();
      }
    },
    async isBackendSuccess(response) {
      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      const resp = response.clone();
      const data = await resp.json();
      return String(data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    async transformBackendResponse(response) {

      return (await response.clone().json()).data;
    },
    async onError(error, response) {
      console.log('Alova: 进入onError处理器:', {
        httpStatus: response?.status,
        responseData: response ? await response.clone().json().catch(() => null) : null,
        errorMessage: error.message
      });

      // 早期检查：如果账号被踢弹窗正在处理中，直接抛出错误而不进行重复处理
      const state = getGlobalDialogState();
      if (state.isProcessing || state.isAccountKickedDialogShowing) {
        const isAccountRelated = response?.status === 401 || response?.status === 403 ||
          (response && await response.clone().json().then(data => String(data.code) === '401').catch(() => false));

        if (isAccountRelated) {
          throw error;
        }
      }

      const authStore = useAuthStore();

      let message = error.message;
      let responseCode = '';
      if (response) {
        const data = await response?.clone().json();
        message = data.msg;
        responseCode = String(data.code);

        // 检测状态码500且包含loginUser为null错误，自动跳转到登录页面
        if (responseCode === '500' && message && message.includes("LoginUser.getSysUser")) {
          authStore.resetStore();
          const { toLogin } = useRouterPush(false);
          toLogin('pwd-login');
          return;
        }
      }

      // 检测业务状态码401，提示账号在其他设备登录
      if (responseCode === '401') {
        // handleAccountKicked(authStore);
        throw error;
      }

      // 检测HTTP 401状态码，提示账号在其他设备登录
      if (response?.status === 401) {
        // handleAccountKicked(authStore);
        throw error;
      }

      // 检测HTTP 403状态码，提示账号在其他设备登录
      if (response?.status === 403) {
        handleAccountKicked(authStore);
        throw error;
      }

      // 检测特定的loginUser为null错误，自动跳转到登录页面
      if (message && message.includes("LoginUser.getSysUser()") && message.includes("loginUser is null")) {
        authStore.resetStore();
        throw error;
      }

      function handleLogout() {
        showErrorMsg(state, message);
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);
        state.errMsgStack = state.errMsgStack.filter((msg: string) => msg !== message);
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        throw error;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !state.errMsgStack?.includes(message)) {
        state.errMsgStack = [...(state.errMsgStack || []), message];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: message,
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });
        throw error;
      }
      showErrorMsg(state, message);
      throw error;
    }
  }
);
