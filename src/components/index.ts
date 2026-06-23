/** 公共样式 */
import "@/assets/styles/app.scss";
/** ElementPlus */
import "element-plus/theme-chalk/display.css";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ISubMenu from "./Layout/subMenu.vue";
import IFillHeader from "./Layout/fillHeader.vue";
import IPage from "./Page/index.vue";
import IImport from "./Import/index.vue";
import IUploadImage from "./Upload/image.vue";
import IImagePreview from "./Image/preview.vue";
import ISelectInventory from "./Select/inventory.vue";
import ITablePreview from "./Table/preview.vue";
import IProgress from "./Progress/index.vue";
import IUploadFile from "./Upload/File.vue";
import ICascaderDepartment from "./Cascader/department.vue";
import IPlatformOrgFilter from "./Platform/OrgFilter.vue";
import IPlatformOrgColumn from "./Platform/OrgColumn.vue";

export const setupComponents = (app: any) => {
  const ElementPlusIconEntries = Object.entries(ElementPlusIconsVue);
  for (const [key, component] of ElementPlusIconEntries) {
    app.component(key, component);
  }
  app.component("ISubMenu", ISubMenu);
  app.component("IFillHeader", IFillHeader);
  app.component("IPage", IPage);
  app.component("IImport", IImport);
  app.component("IUploadImage", IUploadImage);
  app.component("IImagePreview", IImagePreview);
  app.component("ISelectInventory", ISelectInventory);
  app.component("ITablePreview", ITablePreview);
  app.component("IProgress", IProgress);
  app.component("IUploadFile", IUploadFile);
  app.component("ICascaderDepartment", ICascaderDepartment);
  app.component("IPlatformOrgFilter", IPlatformOrgFilter);
  app.component("IPlatformOrgColumn", IPlatformOrgColumn);
};
