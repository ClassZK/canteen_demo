import { request } from "@/utils/Http";
/** 接口授权 */
export const apiAuth = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/video/auth`,
    method: "POST",
    data,
  };
  return request(config);
};
