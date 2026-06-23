import { defineStore } from "pinia";

export const useCanteenStaffAuxStore = defineStore("CanteenStaffAuxStore", {
  state: () => {
    return {
      OperationType: "",
      data: {} as Obj,
      refresh: 0,

      RoleList: [] as Obj[],
    };
  },
});
