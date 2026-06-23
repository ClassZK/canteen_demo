import Version from "tddev/version";
import _utils from "@/utils/index";

import "@/assets/styles/common.scss";
import "element-plus/dist/index.css";

/** 系统初始化之前需要做的工作 */
export default function beforeAppMount() {
  return new Promise<Obj>(resolve => {
    window._env = {
      project: "食安管理系统",
      API_URL_PATH: "local://canteen-web",
      DEPLOY_PATH: "/",
      appID: "canteen-web-local",
      fle: "466dfee1a2e969e49a66dd67bdbca45f",
      ...(window._env || {}),
    };
    window.majorVersion = window.majorVersion || "1.4.0-local";
    window.buildVersion = window.buildVersion || "frontend";
    new Version();
    document.title = _utils.getSystemTitle();
    resolve(window._env);
  });
}
