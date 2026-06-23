import { defineStore } from 'pinia'

export const useFoodDdditiveUsageAuxStore = defineStore('FoodDdditiveUsageAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});