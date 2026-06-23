import { defineStore } from 'pinia'

export const useMorningHealthCheckAuxStore = defineStore('MorningHealthCheckAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});