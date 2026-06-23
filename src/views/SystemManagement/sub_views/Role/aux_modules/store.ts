import { defineStore } from 'pinia'

export const useRoleAuxStore = defineStore('RoleAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          org_id: '',
          roleGroup: 'canteen'
        }
    }
});
