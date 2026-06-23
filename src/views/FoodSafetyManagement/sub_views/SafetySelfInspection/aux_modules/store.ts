import { defineStore } from 'pinia'

export const useSafetySelfInspectionAuxStore = defineStore('SafetySelfInspectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});