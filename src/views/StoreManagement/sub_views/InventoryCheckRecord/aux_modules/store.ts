import { defineStore } from 'pinia'

export const useInventoryCheckRecordAuxStore = defineStore('InventoryCheckRecordAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});