import { defineStore } from 'pinia'

export const useLeadershipInspectionAuxStore = defineStore('LeadershipInspectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});