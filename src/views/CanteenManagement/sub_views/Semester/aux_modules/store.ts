import { defineStore } from "pinia";

export const useSemesterAuxStore = defineStore("SemesterAuxStore", {
  state: () => {
    return {
      OperationType: "",
      data: {} as Obj,
      refresh: 0,
      RoleList: [] as Obj[],
    };
  },
});
