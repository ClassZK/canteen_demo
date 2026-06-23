import { request, baseURL } from "@/utils/Http";

export const UploadBaseURL = `${baseURL}/warehouse/api-warehouse/upload/image`;

/** 获取短信验证码 */
export const apigetMseCaptcha = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/sms`,
    method: "POST",
    data,
  };
  return request(config);
};

/**用户短信登录 */
export const apiSystemUserLoginBySms = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/sms-login`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 密码登录 */
export const apiSystemUserLoginByPassword = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/login-no-captcha`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 第三方授权登录 */
export const apiSystemAuthLogin = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/warehouse/sfs/warehouse/auth/tokenlogin`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 验证码 */
export const apiCaptchaImage = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/image`,
    method: "POST",
  };
  return request(config);
};
/** 登录 */
export const apiSystemUserLogin = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/login`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 登出 */
export const apiSystemUserLogout = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/logout`,
    method: "POST",
  };
  return request(config);
};
/** 查询我的信息 */
export const apiSystemUserinfo = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/auth/userinfo`,
    method: "POST",
  };
  return request(config);
};
/** 修改我的信息 */
export const apiMyInformationUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/edit-profile`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 修改我的密码 */
export const apiMyPasswordChange = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/edit-my-pwd`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 角色字典列表 */
export const apiRoleDictList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/dict`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 角色列表 */
export const apiRoleList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 当前食堂角色字典 */
export const apiRoleDict = (data: Obj = {}): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/dict`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 创建角色 */
export const apiRoleAdd = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/create`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 编辑角色 */
export const apiRoleUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/edit`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除角色 */
export const apiRoleDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/delete`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 详情 */
export const apiRoleDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/info`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 角色权限 */
export const apiRoleRule = (data: Obj = {}): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/role/rules`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 管理员列表 */
export const apiSystemUserList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 创建管理员 */
export const apiSystemUserAdd = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/create`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 编辑管理员 */
export const apiSystemUserUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/edit`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 管理员详情 */
export const apiSystemUserDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/get`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除管理员 */
export const apiSystemUserDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/delete`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 编辑管理员密码 */
export const apiSystemUserPasswordChange = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/admin/edit-pwd`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取设备类型 */
export const apiDeviceTypes = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/types`,
    method: "POST",
  };
  return request(config);
};
/** 获取设备 */
export const apiDeviceList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取设备详情 */
export const apiDeviceDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/get`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 新增设备 */
export const apiDeviceAdd = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/add`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 修改设备 */
export const apiDeviceUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/update`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除设备 */
export const apiDeviceDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/device/delete`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 根据 key 获取配置 Token */
export const apiConfigInfo = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/config/info`,
    method: "POST",
    data,
  };
  return request(config);
};
