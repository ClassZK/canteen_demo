import { defineStore } from 'pinia'

export const useSampleRetentionAuxStore = defineStore('SampleRetentionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});