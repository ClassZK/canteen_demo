import { defineStore } from 'pinia'

export const useWasteDisposalAuxStore = defineStore('WasteDisposalAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});