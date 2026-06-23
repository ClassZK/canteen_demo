import { defineStore } from "pinia";

export const useRecommendationAuxStore = defineStore("RecommendationAuxStore", {
  state: () => {
    return {
      OperationType: "",
      data: {} as Obj,
      refresh: 0,
      RecipeList: [] as Obj[], // 食谱列表
      RecommendationDetail: {} as Obj[], // 推荐详情
      RecipeInfo: {} as Obj, // 食谱信息
    };
  },
});
