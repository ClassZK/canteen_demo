import { localRequest } from "@/mock/localApi";

export const baseURL = "local://canteen-web";

const request = (config: Obj): Promise<HttpResult> => {
  return localRequest(config);
};

export { request };
