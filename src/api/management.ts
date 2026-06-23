import { request } from "@/utils/Http";

/** 查询树形行政区划 */
export const apiAdminDistrictTree = (data: Obj = {}): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/div/tree`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 删除组织 */
export const apiAdminDistrictDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/org/delete`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 编辑或添加组织 */
export const apiAdminDistrictUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/org/merge`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询组织 */
export const apiAdminDistrictPage = (data?: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/org/page`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 查询组织树 */
export const apiAdminDistrictTreePage = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/org/tree`,
    method: "POST",
  };
  return request(config);
};

/** 查询组织列表 */
export const apiAdminDistrictTreeLevel = (data?: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/org/list`,
    method: "POST",
    data,
  };
  return request(config);
};
