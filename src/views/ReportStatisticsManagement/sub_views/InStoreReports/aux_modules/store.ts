import { defineStore } from 'pinia'

export const useInStoreReportsAuxStore = defineStore('InStoreReportsAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});