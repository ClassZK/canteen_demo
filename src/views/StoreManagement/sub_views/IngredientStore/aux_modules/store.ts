import { defineStore } from 'pinia'

export const useIngredientStoreAuxStore = defineStore('IngredientStoreAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          detailRefresh: 0,
          ingredientHistoryVisible: false,
          ingredientHistoryData: {},
          ingredientDetailVisible: false,
          ingredientDetailData: {},
          ingredientSourceVisible: false,
          ingredientSourceData: {},
          ingredientReturnVisible: false,
          ingredientReturnData: {},
          ingredientInData: {} as Obj,
          ingredientInChecked: {} as Obj,
          ingredientPrintVisible: false,
          ingredientPrintData: {} as Obj,
        }
    }
});