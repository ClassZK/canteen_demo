import { request } from "@/utils/Http";
/** 分页查询每日巡检 */
export const apiDailyPatrolList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-daily-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取每日巡检详情 */
export const apiDailyPatrolDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/get-daily-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询每月巡检 */
export const apiMonthlyPatrolList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-monthly-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取每月巡检详情 */
export const apiMonthlyPatrolDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/get-monthly-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询评价 */
export const apiEvaluationList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-apprais`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询投诉 */
export const apiComplaintList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-complaints`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 审查每月巡检 */
export const apiMonthlyPatrolReview = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/censor-monthly-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 提交每日巡检 */
export const apiDailyPatrolSubmit = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/submit-daily-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 提交每月巡检 */
export const apiMonthlyPatrolSubmit = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/submit-monthly-inspcetion`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取管控排查模板 */
export const apiInspectionTemplateDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/get-inspection-template`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 保存管控排查模板 */
export const apiInspectionTemplateSave = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/merge-inspection-template`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 查询管控排查模板分类 */
export const apiInspectionTemplateCategories = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/list-inspection-template-categories`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 查询全部学校 */
export const apiRestaurantListAll = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/unit/list-catering-units`,
    method: "POST",
  };
  return request(config);
};
/** 分页查询学校 */
export const apiRestaurantList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/unit/page-catering-units`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取学校详情 */
export const apiRestaurantDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/unit/get-catering-units`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询监督 */
export const apiSupervisionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-supervise`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加监督 */
export const apiSupervisionAdd = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/add-supervise`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 处理监督 */
export const apiSupervisionHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/process-supervise`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 月调度详情 */
export const apiSupervisionDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/get-supervise`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询公告 */
export const apiNoticeList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/notice/page-notice`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 公告详情 */
export const apiNoticeDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/notice/get-notice`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加/修改公告 */
export const apiNoticeUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/notice/merge-notice`,
    method: "POST",
    data,
  };
  return request(config);
};
