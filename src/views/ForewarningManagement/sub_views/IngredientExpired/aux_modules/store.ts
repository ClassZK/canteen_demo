import { defineStore } from 'pinia'

export const useIngredientExpiredAuxStore = defineStore('IngredientExpiredAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});