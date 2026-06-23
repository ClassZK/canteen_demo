import { defineStore } from "pinia";

export const useFourPestDisinfectionAuxStore = defineStore("FourPestDisinfectionAuxStore", {
  state: () => {
    return {
      OperationType: "",
      data: {} as Obj,
      refresh: 0,
    };
  },
});
