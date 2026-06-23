import { request } from "@/utils/Http";

/** 分页查询食材 */
export const apiIngredientList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-ingredient`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询菜品 */
export const apiDishesTypeList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-dish`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 查询菜品详情 */
export const apiDishesTypeDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-dish`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改菜品 */
export const apiDishesTypeUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/merge-dish`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除菜品 */
export const apiDishesTypeDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/delete-dish`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询配餐对象 */
export const apiCateringObjectList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-catering-objects`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 查询配餐对象列表 */
export const apiCateringObjectListAll = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/list-catering-objects`,
    method: "POST",
  };
  return request(config);
};
/** 查询配餐对象详情 */
export const apiCateringObjectDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-catering-objects`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改菜品 */
export const apiCateringObjectUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/merge-catering-objects`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除菜品 */
export const apiCateringObjectDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/delete-catering-objects`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询食谱 */
export const apiRecipeList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 查询食谱详情 */
export const apiRecipeDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改食谱 */
export const apiRecipeUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/merge-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除修改食谱 */
export const apiRecipeDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/delete-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 本周食谱 */
export const apiRecipeWeek = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-current-week-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询从业人员 */
export const apiCanteenStaffList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-practitioners`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 查询从业人员详情 */
export const apiCanteenStaffDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-practitioners`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改从业人员 */
export const apiCanteenStaffUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/merge-practitioners`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 从业人员离职 */
export const apiCanteenStaffResign = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/delete-practitioners`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 导入从业人员 */
export const apiCanteenStaffImport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/import-practitioners`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 食谱分析 */
export const apiCanteenRecipeAnalysis = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/recipe-analysis`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取活动详情 */
export const apiCanteenActivityDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/get-activity`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取问卷 */
export const apiCanteenQuestionnaireDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/get-questionnaire`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改陪餐活动 */
export const apiCanteenActivityUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/merge-ac-activity`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改问卷 */
export const apiCanteenQuestionnaireUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/merge-questionnaire`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询陪餐活动 */
export const apiCanteenActivityList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/page-ac-activity`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 发送问卷短信 */
export const apiCanteenQuestionnaireList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/send-questionnaire-sms`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除活动 */
export const apiCanteenActivityDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/delete-activity`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除学生家长 */
export const apiCanteenStudentParentDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/delete-student-parent`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 导入学生家长 */
export const apiCanteenStudentParentImport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/import-student-parent`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询学生家长 */
export const apiCanteenStudentParentList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/page-student-parent`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取活动问卷 */
export const apiCanteenActivityQuestionnaireList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/questionnaire/get-questionnaire-info`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询角色 */
export const apiCanteenRoleList = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/sys/role/list`,
    method: "POST",
  };
  return request(config);
};
/** 分页查询学期 */
export const apiCanteenSemesterList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/semester/page`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 添加修改学期 */
export const apiCanteenSemesterUpdate = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/semester/merge`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除学期 */
export const apiCanteenSemesterDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/semester/delete`,
    method: "POST",
    data,
  };
  return request(config);
};

// 导出采购量建议
export const apiCanteenPurchaseSuggestionExport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/export-recipe-volume-suggestion`,
    method: "POST",
    data,
  };
  return request(config);
};
// 获取采购量建议
export const apiCanteenPurchaseSuggestionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-recipe-volume-suggestion`,
    method: "POST",
    data,
  };
  return request(config);
};
// 查询采购量建议详情
export const apiCanteenPurchaseSuggestionDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-recipe-volume-suggestion-detail`,
    method: "POST",
    data,
  };
  return request(config);
};
// 查询食谱列表
export const apiCanteenPurchaseSuggestionPageList = (data?: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/list-recipe`,
    method: "POST",
    data,
  };
  return request(config);
};
// 分页查询采购量建议
export const apigetvolume = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/page-recipe-volume`,
    method: "POST",
    data,
  };
  return request(config);
};
// 提交采购量建议-同时进行下单
export const apiCanteenPurchaseSuggestionSubmit = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/save-recipe-volume`,
    method: "POST",
    data,
  };
  return request(config);
};
// 分页查询采购成本详情
export const apiCanteenPurchaseCostStatisticsDetailList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/procurementcosts-detail/page`,
    method: "POST",
    data,
  };
  return request(config);
};
// 下单采购量建议
export const apiCanteenPurchaseSuggestionOrder = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/reorder-recipe-volume`,
    method: "POST",
    data,
  };
  return request(config);
};
//查询采购量建议下单状态
export const apiCanteenPurchaseSuggestionOrderStatus = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/recipe/get-recipe-volume-suggestion-order-info`,
    method: "POST",
    data,
  };
  return request(config);
};
