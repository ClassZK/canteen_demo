import { defineStore } from 'pinia'

export const useDailyPurchasePriceAuxStore = defineStore('DailyPurchasePriceAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});