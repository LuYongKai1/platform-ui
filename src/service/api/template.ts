/** 新增模板 */
export function fetchAddTemplate(data: Api.SystemManage.template) {
  return request.post<Api.SystemManage.template>('/template/add', data);
}
