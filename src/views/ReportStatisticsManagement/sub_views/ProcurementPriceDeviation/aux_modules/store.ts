import { defineStore } from 'pinia'

export const useProcurementPriceDeviationAuxStore = defineStore('ProcurementPriceDeviationAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});