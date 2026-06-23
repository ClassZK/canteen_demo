import { defineStore } from 'pinia'

export const useEquipmentAuxStore = defineStore('EquipmentAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          equipmentList: [] as Obj[],
          org_id: '',
        }
    }
});