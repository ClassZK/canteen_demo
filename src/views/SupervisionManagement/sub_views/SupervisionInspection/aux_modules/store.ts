import { defineStore } from 'pinia'

export const useSupervisionInspectionAuxStore = defineStore('SupervisionInspectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});