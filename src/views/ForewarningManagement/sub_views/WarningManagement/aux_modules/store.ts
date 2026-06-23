import { defineStore } from 'pinia'

export const useWarningManagementAuxStore = defineStore('WarningManagementAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});