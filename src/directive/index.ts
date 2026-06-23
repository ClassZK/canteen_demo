/**
 * v-permission：自定义权限验证指令
 * 包含字符串和数组两种用法，通常情况下使用字符串用法即可：
 * 1、字符串：
 *    <div v-permission="'权限标识'"></div>
 *
 * 2、数组，用于多个权限同时满足时：
 *    <div v-permission="['权限标识1', '权限标识2']"></div>
 */

import Storage from "tddev/storage";
import _ from "tddev/utils";
export const setupDirective = (app: any) => {
  app.directive("permission", {
    /** 权限数组 */
    mounted(el: any, binding: any) {
      const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
      let roles: string[] = [];
      if (_.isNotEmptyString(systemUserinfo.rule)) {
        roles = systemUserinfo.rule.split(",");
      }
      if (Array.isArray(roles)) {
        let permission: string[] = [];
        for (const item of roles) {
          const rules = item.split(",");
          permission = [...permission, ...rules];
        }
        if (permission.includes("*")) {
          /** *表示拥有所有权限 */
        } else {
          /** 权限类型判断 */
          const { value } = binding;
          if (typeof value === "string") {
            /** 字符串参数 */
            const boolean = permission.includes(value);
            if (!boolean) {
              /** 没有权限 */
              el.remove();
            }
          } else if (Array.isArray(value)) {
            /** 数组参数 */
            const boolean = permission.every(item => value.includes(item));
            if (!boolean) {
              /** 没有权限 */
              el.remove();
            }
          }
        }
      }
    },
  });
};
