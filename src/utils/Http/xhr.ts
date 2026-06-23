import { localRequest } from "@/mock/localApi";

export default abstract class XhrHttp {
  static getBase = <T extends Obj = Obj>(url: string, params?: Obj): Promise<T> => {
    return localRequest({ url, method: "GET", data: params }).then(result => result.data as T);
  };

  static postBase = <T extends Obj = Obj>(url: string, params?: Obj): Promise<T> => {
    return localRequest({ url, method: "POST", data: params }).then(result => result.data as T);
  };

  static get = (url: string, params?: Obj): Promise<HttpResult> => {
    return localRequest({ url, method: "GET", data: params });
  };

  static post = (url: string, params?: Obj): Promise<HttpResult> => {
    return localRequest({ url, method: "POST", data: params });
  };
}
