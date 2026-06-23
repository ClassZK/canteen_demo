import _ from "tddev/utils";
import Storage from "tddev/storage";
import { dateFilter, timestampFilter } from "@/utils/Dayjs";

export default class _utils {
  /** 是否使用全链路加密 */
  static isUseFLE = (): boolean => {
    return _.getEnv("fle") !== "466dfee1a2e969e49a66dd67bdbca45f";
  };

  /** 系统名称 */
  static getSystemTitle = () => {
    const title = "食安管理系统";
    const SystemTitle = Storage.get("SystemTitle") ?? title;
    return SystemTitle;
  };
  /** 系统logo */
  static getSystemLogo = () => {
    const logo = new URL(`@/assets/image/logo.png`, import.meta.url).href;
    const SystemLogo = Storage.get("SystemLogo") ?? logo;
    return SystemLogo;
  };

  static loginCheck = () => {
    const token = Storage.get("token");
    const systemUserinfo = Storage.get("systemUserinfo");
    if (token && systemUserinfo) {
      return true;
    } else {
      this.loginClear();
      return false;
    }
  };

  static loginClear = () => {
    Storage.clear();
  };

  static aTagDownload = (url: string, name: string) => {
    const suffix = url.slice(url.lastIndexOf("."));
    let a = document.createElement("a");
    a.href = url;
    a.download = name + suffix;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  static aTagDownloadFile = (data: any, name: string, type = "application/vnd.ms-excel;charset=utf-8") => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  static durationConversion = (value: any) => {
    let time = "0";
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = value % 60;
      if (hours > 0) {
        time = `${hours}小时${minutes}分${seconds}秒`;
      } else if (minutes > 0) {
        time = `${minutes}分${seconds}秒`;
      } else if (seconds > 0) {
        time = `${value}秒`;
      }
    }
    return time;
  };

  static xTimestamp = () => {
    return Number(new Date().getTime() / 1000).toFixed(0);
  };

  static permissionFilter = (value: string | string[]) => {
    return true;
    let bool = true;
    const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
    if (Array.isArray(systemUserinfo.roles)) {
      let permission: string[] = [];
      for (const item of systemUserinfo.roles) {
        const rules = item.rule.split(",");
        permission = [...permission, ...rules];
      }
      if (permission.includes("*")) {
        /** *表示拥有所有权限 */
      } else {
        /** 权限类型判断 */
        if (typeof value === "string") {
          /** 字符串参数 */
          const boolean = permission.includes(value);
          if (!boolean) {
            /** 没有权限 */
            bool = false;
          }
        } else if (Array.isArray(value)) {
          /** 数组参数 */
          const boolean = permission.every(item => value.includes(item));
          if (!boolean) {
            /** 没有权限 */
            bool = false;
          }
        }
      }
    }
    return bool;
  };

  static permissionAnyFilter = (value: string | string[]) => {
    return true;
    const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
    const permission = _.getArray(systemUserinfo?.rule?.split(","));
    if (permission.includes("*")) {
      return true;
    }
    if (typeof value === "string") {
      return permission.includes(value);
    }
    if (Array.isArray(value)) {
      return value.some(item => permission.includes(item));
    }
    return false;
  };

  static isPlatformUser = () => {
    const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
    return systemUserinfo?.user_scope === "platform";
  };

  static isPlatformBusinessReadonly = () => {
    return false;
  };

  /** 获取本周开始和结束日期（周一至周日） */
  static getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0是周日，1是周一...6是周六
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 计算与周一的差值

    /** 本周开始日期（周一） */
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    /** 本周结束日期（周日） */
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    /** 格式化日期为YYYY-MM-DD */
    function formatDate(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return {
      start: formatDate(monday),
      end: formatDate(sunday),
    };
  }

  static weekDays: Obj = { 0: "周日", 1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五", 6: "周六" };

  /** 获取周 */
  static getCurrentWeeks(startWeek: string) {
    let weeks = [];
    for (let i = 0; i < 7; i++) {
      const startTimestamp = timestampFilter(startWeek);
      const timestamp = startTimestamp + 24 * 60 * 60 * 1000 * i;
      const date = dateFilter(timestamp);
      const day = new Date(timestamp).getDay();
      weeks.push({
        date,
        week: this.weekDays[day],
      });
    }
    return weeks;
  }

  static getDefaultArray = (data: any) => {
    let array: Obj[] = [];
    if (Array.isArray(data)) {
      array = data;
    }
    return array;
  };

  static YtoF = (value: number | string) => {
    let money = 0;
    if (value) {
      const m = Number(value) * 100;
      if (Number.isFinite(m)) {
        money = m;
      }
    }
    return money;
  };
  static FtoY = (value: number | string) => {
    let money = 0;
    if (value) {
      const m = Number(value) / 100;
      if (Number.isFinite(m)) {
        money = m;
      }
    }
    return money;
  };

  static JtoK = (value: number | string, type: number = 2) => {
    let weight = value;
    if (value && type === 1) {
      weight = Number(value) * 500;
    }
    return Number(weight);
  };
  static KtoJ = (value: number | string, type: number = 2) => {
    let weight = 0;
    if (value && type === 1) {
      // 保留两位小数
      const m = (Number(value) / 500).toFixed(2);
      weight = Number(m);
    } else {
      return Number(value);
    }
    return weight;
  };

  /** 文件类型 */
  static imageType = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".svg", ".webp", ".heic", ".avif", ".tif"];
  static documentType = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];
  static videoType = [".mp4", ".flv", "avi", "wmv", ".ogg"];

  /** 判断文件类型 */
  static getFileType = (file = "") => {
    const index = file.lastIndexOf(".");
    const suffix = file.slice(index);
    const isImage = this.imageType.find(item => item === suffix);
    if (isImage) {
      return "image";
    }
    const isDocument = this.documentType.find(item => item === suffix);
    if (isDocument) {
      return "document";
    }
    const isVideo = this.videoType.find(item => item === suffix);
    if (isVideo) {
      return "video";
    }
  };
}
