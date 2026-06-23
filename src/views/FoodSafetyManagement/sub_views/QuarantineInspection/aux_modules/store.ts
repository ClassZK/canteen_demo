import { defineStore } from 'pinia'

export const useQuarantineInspectionAuxStore = defineStore('QuarantineInspectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});