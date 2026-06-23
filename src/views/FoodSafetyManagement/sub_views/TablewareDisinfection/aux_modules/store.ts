import { defineStore } from 'pinia'

export const useTablewareDisinfectionAuxStore = defineStore('TablewareDisinfectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});