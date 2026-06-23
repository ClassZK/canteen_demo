import { defineStore } from 'pinia'

export const useDailyPatrolAuxStore = defineStore('DailyPatrolAuxStore', {
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