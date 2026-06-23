import { defineStore } from 'pinia'

export const useOutStoreReportsAuxStore = defineStore('OutStoreReportsAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});