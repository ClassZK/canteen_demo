import { defineStore } from 'pinia'

export const useUserAuxStore = defineStore('UserAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          roleList: [] as Obj[],
          org_id: '',
          roleGroup: 'canteen'
        }
    }
});
