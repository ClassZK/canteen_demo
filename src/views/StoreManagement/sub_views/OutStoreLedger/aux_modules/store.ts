import { defineStore } from 'pinia'

export const useOutStoreLedgerAuxStore = defineStore('OutStoreLedgerAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});