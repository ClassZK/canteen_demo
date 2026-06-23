import { defineStore } from 'pinia'

export const useCleaningRecordAuxStore = defineStore('CleaningRecordAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});