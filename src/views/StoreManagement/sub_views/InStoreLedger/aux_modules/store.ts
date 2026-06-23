import { defineStore } from 'pinia'

export const useInStoreLedgerAuxStore = defineStore('InStoreLedgerAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});