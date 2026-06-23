import { defineStore } from "pinia";

export const useOrganizationAuxStore = defineStore("OrganizationAuxStore", {
  state: () => {
    return {
      districtTree: [] as Obj[],
      query: {
        keyword: "",
      },
      logType: 0,
      pid: "",
      current: {} as Obj,
      checked: {} as Obj,
      getOrg: false,
    };
  },
});
