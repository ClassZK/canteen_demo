import { defineStore } from "pinia";

export const usePurchasingAuxStore = defineStore("Purchasing", {
  state: () => {
    return {
      active: "semester",
      query: {
        page: 1,
        size: 20,
        start_time: "",
        end_time: "",
      } as Obj,
      times: [] as string[] | string,
      timeType: "",
    };
  },
});
