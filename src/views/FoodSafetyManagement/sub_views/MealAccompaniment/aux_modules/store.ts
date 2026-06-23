import { defineStore } from 'pinia'

export const useMealAccompanimentAuxStore = defineStore('MealAccompanimentAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});