import { defineStore } from "pinia";

type State = {
  OperationType: string;
  data: Obj;
  refresh: number;
  isProcurementDetail: boolean;
};

export const useMonthlyPurchasePriceAuxStore = defineStore<string, State>(
  "MonthlyPurchasePriceAuxStore",
  {
    state: () => {
      return {
        OperationType: "",
        data: {},
        refresh: 0,
        isProcurementDetail: false,
      };
    },
  }
);
