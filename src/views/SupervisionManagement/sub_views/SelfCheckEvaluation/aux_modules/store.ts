import { defineStore } from 'pinia'

export const useSelfCheckEvaluationAuxStore = defineStore('SelfCheckEvaluationAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          checkItemDetailVisible: false,
          checkItemDetailData: {} as Obj,
        }
    }
});