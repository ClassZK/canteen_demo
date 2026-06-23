import { defineStore } from 'pinia'

export const useCanteenRecipeAuxStore = defineStore('CanteenRecipeAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});