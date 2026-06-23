import { request } from "@/utils/Http";

/** 分页查询食品留样 */
export const apiFoodRetentionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-food-retention`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改食品留样 */
export const apiFoodRetentionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-food-retention`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除食品留样 */
export const apiFoodRetentionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-food-retention`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 销样食品留样 */
export const apiFoodRetentionDestroy = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/destroy-food-retention`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询检疫检测 */
export const apiQuarantineTestingList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-quarantine-testing`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改检疫检测 */
export const apiQuarantineTestingUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-quarantine-testing`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除检疫检测 */
export const apiQuarantineTestingDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-quarantine-testing`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询晨检记录 */
export const apiMorningInspectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-morning-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改晨检记录 */
export const apiMorningInspectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-morning-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除晨检记录 */
export const apiMorningInspectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-morning-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询清洁记录 */
export const apiCleaningRecordList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-cleaning-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改清洁记录 */
export const apiCleaningRecordUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-cleaning-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除清洁记录 */
export const apiCleaningRecordDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-cleaning-record`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询环境消毒 */
export const apiEnvironmentalDisinfectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-environmental-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改环境消毒 */
export const apiEnvironmentalDisinfectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-environmental-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除环境消毒 */
export const apiEnvironmentalDisinfectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-environmental-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询餐具消毒 */
export const apiTablewareDisinfectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-disinfect-dises`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改餐具消毒 */
export const apiFourPestDisinfectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-four-pest-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
export const apiFourPestDisinfectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-four-pest-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
export const apiFourPestDisinfectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-four-pest-disinfection`,
    method: "POST",
    data,
  };
  return request(config);
};
export const apiTablewareDisinfectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-disinfect-dises`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除餐具消毒 */
export const apiTablewareDisinfectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-disinfect-dises`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询安全检查 */
export const apiSafeInspectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-safety-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改安全检查 */
export const apiSafeInspectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-safety-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除安全检查 */
export const apiSafeInspectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-safety-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询废弃物处置 */
export const apiWasteDisposalList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-waste-disposal`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改废弃物处置 */
export const apiWasteDisposalUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-waste-disposal`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除废弃物处置 */
export const apiWasteDisposalDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-waste-disposal`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询陪餐记录 */
export const apiMealAccompanimentList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-meal-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改陪餐记录 */
export const apiMealAccompanimentUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-meal-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除陪餐记录 */
export const apiMealAccompanimentDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-meal-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询领导视察 */
export const apiLeadershipInspectionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-leader-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改领导视察 */
export const apiLeadershipInspectionUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-leader-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除领导视察 */
export const apiLeadershipInspectionDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-leader-inspection`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询食品添加剂使用情况 */
export const apiFoodAdditivesUseList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/page-food-additive-useage`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改食品添加剂使用情况 */
export const apiFoodAdditivesUseUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/merge-food-additive-useage`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除食品添加剂使用情况 */
export const apiFoodAdditivesUseDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/inspection/delete-food-additive-useage`,
    method: "POST",
    data,
  };
  return request(config);
};
