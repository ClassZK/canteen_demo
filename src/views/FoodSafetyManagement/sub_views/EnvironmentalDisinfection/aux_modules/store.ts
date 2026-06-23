import { defineStore } from 'pinia'

export const useEnvironmentalDisinfectionAuxStore = defineStore('EnvironmentalDisinfectionAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});