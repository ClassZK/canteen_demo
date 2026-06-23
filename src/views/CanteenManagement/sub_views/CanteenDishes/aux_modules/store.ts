import { defineStore } from 'pinia'

export const useCanteenDishesAuxStore = defineStore('CanteenDishesAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});