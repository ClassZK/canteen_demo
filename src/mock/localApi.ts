import Storage from "tddev/storage";

type MockConfig = {
  url?: string;
  method?: string;
  data?: Obj;
  params?: Obj;
};

type LocalDb = {
  rows: Obj[];
  users: Obj[];
  roles: Obj[];
  orgTree: Obj[];
  templates: Record<string, Obj>;
};

const STORE_KEY = "canteen-web-local-db-v5";
const today = "2026-06-23";
const imageData =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="220" viewBox="0 0 360 220">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#e8f4ff"/>
          <stop offset="1" stop-color="#d8f7e8"/>
        </linearGradient>
      </defs>
      <rect width="360" height="220" rx="18" fill="url(#g)"/>
      <circle cx="78" cy="74" r="34" fill="#42b883" opacity=".9"/>
      <rect x="126" y="54" width="162" height="16" rx="8" fill="#2684ff" opacity=".65"/>
      <rect x="126" y="88" width="116" height="12" rx="6" fill="#5c6f82" opacity=".35"/>
      <rect x="48" y="140" width="264" height="28" rx="14" fill="#ffffff" opacity=".82"/>
      <text x="180" y="159" text-anchor="middle" font-size="18" font-family="Arial" fill="#1f3349">CANTEEN LOCAL DEMO</text>
    </svg>
  `);

const fullRule = "*";
const dateList = ["2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22", "2026-06-23"];

const demoUser: Obj = {
  admin_id: "u-admin",
  id: "u-admin",
  account: "admin",
  nick: "演示管理员",
  name: "演示管理员",
  mobile: "13800000000",
  phone: "13800000000",
  user_scope: "canteen",
  org_id: "org-c1",
  org_name: "第一中学食堂",
  rule: fullRule,
  role_name: "超级管理员",
  roles: [{ role_id: "role-admin", id: "role-admin", name: "超级管理员", role_name: "超级管理员", rule: fullRule }],
  orgs: [
    { org_id: "org-c1", id: "org-c1", org_name: "第一中学食堂", org_type: "canteen" },
    { org_id: "org-c2", id: "org-c2", org_name: "实验小学食堂", org_type: "canteen" },
  ],
};

const roles: Obj[] = [
  { id: "role-admin", role_id: "role-admin", name: "超级管理员", role_name: "超级管理员", group: "系统管理", rule: fullRule, remark: "拥有全部权限", org_name: "第一中学食堂" },
  { id: "role-canteen", role_id: "role-canteen", name: "食堂管理员", role_name: "食堂管理员", group: "食堂管理", rule: fullRule, remark: "食堂业务管理", org_name: "第一中学食堂" },
  { id: "role-stock", role_id: "role-stock", name: "库管", role_name: "库管", group: "库存管理", rule: "food_inventory,inventory_manage,received_confirm", remark: "库存与签收", org_name: "第一中学食堂" },
  { id: "role-safety", role_id: "role-safety", name: "安全员", role_name: "安全员", group: "食安管理", rule: "food_safety_manage,food_sample,morning_check,cleaning_record", remark: "食安台账", org_name: "第一中学食堂" },
];

const orgTree: Obj[] = [
  {
    org_id: "org-root",
    id: "org-root",
    pid: "",
    parent_id: "",
    org_name: "达州智慧供餐集团",
    name: "达州智慧供餐集团",
    label: "达州智慧供餐集团",
    org_type: "platform",
    address: "达州市通川区校园路 1 号",
    icon_url: imageData,
    business_license_image: imageData,
    license_image: imageData,
    independent: "1",
    children: [
      {
        org_id: "org-p1",
        id: "org-p1",
        pid: "org-root",
        parent_id: "org-root",
        org_name: "达州校园供餐项目",
        name: "达州校园供餐项目",
        label: "达州校园供餐项目",
        org_type: "project",
        address: "达州市通川区校园路 8 号",
        icon_url: imageData,
        business_license_image: imageData,
        license_image: imageData,
        independent: "1",
        children: [
          {
            org_id: "org-c1",
            id: "org-c1",
            pid: "org-p1",
            parent_id: "org-p1",
            org_name: "第一中学食堂",
            name: "第一中学食堂",
            label: "第一中学食堂",
            org_type: "canteen",
            address: "达州市通川区校园路 88 号",
            icon_url: imageData,
            business_license_image: imageData,
            license_image: imageData,
            independent: "1",
          },
          {
            org_id: "org-c2",
            id: "org-c2",
            pid: "org-p1",
            parent_id: "org-p1",
            org_name: "实验小学食堂",
            name: "实验小学食堂",
            label: "实验小学食堂",
            org_type: "canteen",
            address: "达州市通川区明月路 26 号",
            icon_url: imageData,
            business_license_image: imageData,
            license_image: imageData,
            independent: "0",
          },
        ],
      },
    ],
  },
];

const permissionRules: Obj[] = [
  { id: "m-home", pid: "", title: "总览", name: "总览", rule: "home", group: "基础" },
  { id: "m-canteen", pid: "", title: "食堂管理", name: "食堂管理", rule: "canteen_manage", group: "食堂管理" },
  { id: "m-store", pid: "", title: "食材库存", name: "食材库存", rule: "food_inventory", group: "库存管理" },
  { id: "m-report", pid: "", title: "统计报表", name: "统计报表", rule: "statistical_report", group: "统计报表" },
  { id: "m-warning", pid: "", title: "预警管理", name: "预警管理", rule: "warn_manage", group: "预警管理" },
  { id: "m-safety", pid: "", title: "食安管理", name: "食安管理", rule: "food_safety_manage", group: "食安管理" },
  { id: "m-supervision", pid: "", title: "共治监管", name: "共治监管", rule: "supervision_manage", group: "共治监管" },
  { id: "m-system", pid: "", title: "系统管理", name: "系统管理", rule: "org_manage", group: "系统管理" },
].map(item => ({ ...item, label: item.title || item.name, value: item.rule }));

const common = (kind: string, index: number, extra: Obj = {}): Obj => ({
  kind,
  id: `${kind}-${index + 1}`,
  [`${kind}_id`]: `${kind}-${index + 1}`,
  org_id: "org-c1",
  org_name: "第一中学食堂",
  canteen_name: "第一中学食堂",
  unit_name: "第一中学食堂",
  created_at: `${today} ${String(8 + (index % 9)).padStart(2, "0")}:30`,
  updated_at: `${today} ${String(9 + (index % 9)).padStart(2, "0")}:15`,
  create_time: `${today} ${String(8 + (index % 9)).padStart(2, "0")}:30`,
  date: today,
  image: imageData,
  image_url: imageData,
  images: imageData,
  status: index % 2 === 0 ? "0" : "1",
  state: index % 2,
  remark: "本地演示数据，可新增、编辑、删除并保存在浏览器 localStorage。",
  ...extra,
});

const makeIngredientRows = (): Obj[] =>
  [
    ["番茄", "蔬菜", "达州放心配送", 80],
    ["鸡蛋", "蛋类", "校园鲜配", 120],
    ["土豆", "蔬菜", "达州放心配送", 95],
    ["牛肉", "肉类", "安心肉联", 32],
    ["青菜", "蔬菜", "校园鲜配", 68],
    ["豆腐", "豆制品", "达州放心配送", 44],
  ].map(([name, type, supplier, count], index) =>
    common("ingredient", index, {
      name,
      title: name,
      pro_name: name,
      product_name: name,
      ingredient_name: name,
      pro_no: `SC-2026062${index + 1}`,
      batch_no: `B2026062${index + 1}`,
      pro_cover: imageData,
      pro_type_name: type,
      pro_type_pname: type,
      category: type,
      category_name: type,
      specification: "散称",
      supplier_name: supplier,
      shop_name: supplier,
      unit: "kg",
      measure_type: 2,
      count,
      old_count: Number(count) + 20,
      in_count: 30 + index * 3,
      out_count: 14 + index * 2,
      old_money: 120000 + index * 8000,
      in_money: 32000 + index * 6000,
      out_money: 18000 + index * 4000,
      money: 98000 + index * 7000,
      guide_price: 420 + index * 60,
      in_guide_price: 430 + index * 60,
      out_guide_price: 415 + index * 60,
      price: 420 + index * 60,
      amount: Number(count) * (420 + index * 60),
      expire_date: "2026-07-01",
      expired_day: 7 + index,
      shelf_life: 7 + index,
    })
  );

const makeDishRows = (): Obj[] =>
  [
    ["番茄炒蛋", "3", "番茄、鸡蛋"],
    ["土豆烧牛肉", "3", "土豆、牛肉"],
    ["青菜豆腐汤", "5", "青菜、豆腐"],
    ["宫保鸡丁", "3", "鸡肉、花生"],
  ].map(([name, category, ingredient], index) =>
    common("dish", index, {
      name,
      title: name,
      dish_name: name,
      recipe_name: name,
      category,
      category_name: category === "5" ? "汤类" : "荤菜",
      content: `${name}本地演示说明`,
      ingredient,
      ingredients: ingredient,
      quantity: 100 + index * 20,
      energy: 180 + index * 35,
      protein: 12 + index,
      fat: 8 + index,
      carbohydrate: 20 + index * 2,
      sodium: 1 + index,
      price: 800 + index * 120,
      image: imageData,
      cover: imageData,
    })
  );

const makeRecipeRows = (): Obj[] =>
  [
    ["幼儿园春季营养食谱", "幼儿园小班", "3-6岁"],
    ["小学低年级一周食谱", "小学低年级", "6-9岁"],
    ["中学生高蛋白午餐", "中学生", "12-18岁"],
  ].map(([recipeName, objectName, ageRange], index) =>
    common("recipe", index, {
      recipe_name: recipeName,
      name: recipeName,
      object_name: objectName,
      age_range: ageRange,
      creator: "演示管理员",
      date_start: "2026-06-22",
      date_end: "2026-06-28",
      meal_types: "0,2,4",
      meal_time: today,
      list: makeWeekRecipeList(),
    })
  );

const makeCateringRows = (): Obj[] =>
  [
    ["幼儿园小班", "0,2,4", "3-6岁"],
    ["小学低年级", "0,2,4", "6-9岁"],
    ["中学生", "2,4", "12-18岁"],
  ].map(([objectName, mealTypes, ageRange], index) =>
    common("catering", index, {
      object_name: objectName,
      name: objectName,
      meal_types: mealTypes,
      age_range: ageRange,
      people_count: 320 + index * 120,
    })
  );

const makeStaffRows = (): Obj[] =>
  [
    ["张厨师", "厨师长"],
    ["李安全", "食品安全员"],
    ["王库管", "库管"],
    ["赵帮厨", "帮厨"],
  ].map(([name, roleName], index) =>
    common("staff", index, {
      name,
      nick: name,
      staff_name: name,
      user_name: name,
      sex: String(index % 2),
      age: 32 + index,
      birthday: `199${index}-05-12`,
      id_card: `51010019900${index + 1}12123${index}`,
      phone: `1380000000${index}`,
      position: roleName,
      role: index === 2 ? "role-stock" : index === 1 ? "role-safety" : "role-canteen",
      role_name: roleName,
      user_avatar_uri: imageData,
      health_cert: imageData,
      health_cert_expire_date: "2026-12-31",
      health_cert_status: index === 3 ? "expiring" : "normal",
      no_criminal_cert: imageData,
      certificate: imageData,
      health_certificate_no: `JK20260${index + 1}`,
      health_certificate_expire_at: "2026-12-31",
      entry_time: "2025-09-01",
      status: index === 3 ? "1" : "0",
      avatar: imageData,
    })
  );

const makeOrderRows = (): Obj[] => [
  common("order", 0, {
    id: "order-1",
    order_id: "order-1",
    order_no: "PS20260623001",
    shop_name: "达州放心配送",
    supplier_name: "达州放心配送",
    shipping_address: "食堂后门收货区",
    address: "食堂后门收货区",
    status: "待收货",
    receipt_status: "pending",
    order_time: `${today} 08:30`,
    goods_total: 3,
    total_price: 64000,
    list: [
      { id: "oi-1", product_name: "番茄", ingredient_name: "番茄", category_name: "蔬菜", count: 30, send_count: 30, received_count: 30, unit: "kg", price: 420, settle_price: 420 },
      { id: "oi-2", product_name: "牛肉", ingredient_name: "牛肉", category_name: "肉类", count: 18, send_count: 18, received_count: 18, unit: "kg", price: 5600, settle_price: 5600 },
      { id: "oi-3", product_name: "豆腐", ingredient_name: "豆腐", category_name: "豆制品", count: 20, send_count: 20, received_count: 20, unit: "kg", price: 380, settle_price: 380 },
    ],
  }),
  common("order", 1, {
    id: "order-2",
    order_id: "order-2",
    order_no: "PS20260622008",
    shop_name: "校园鲜配",
    supplier_name: "校园鲜配",
    shipping_address: "实验小学食堂验收区",
    address: "实验小学食堂验收区",
    status: 2,
    receipt_status: "done",
    order_time: "2026-06-22 09:20",
    goods_total: 2,
    total_price: 28000,
    list: [
      { id: "oi-4", product_name: "青菜", ingredient_name: "青菜", category_name: "蔬菜", count: 25, send_count: 25, received_count: 25, unit: "kg", price: 360, settle_price: 360 },
      { id: "oi-5", product_name: "鸡蛋", ingredient_name: "鸡蛋", category_name: "蛋类", count: 45, send_count: 45, received_count: 45, unit: "kg", price: 620, settle_price: 620 },
    ],
  }),
];

const makeInspectionRows = (): Obj[] => {
  const names = ["食品留样", "检疫检测", "晨检记录", "清洁消毒", "环境消毒", "餐具消毒", "四害消杀", "安全自查", "废弃物处置", "食品添加剂", "陪餐记录", "视察记录"];
  return names.map((name, index) =>
    common("inspection", index, {
      name,
      title: name,
      item: index % 2 === 0 ? "农残检测" : "日常检查",
      content: `${name}演示内容`,
      region: "后厨操作区",
      sample_name: "番茄炒蛋",
      sample_weight: 125,
      sample_meal_types: "2",
      sample_time: `${today} 11:30`,
      personnel_name: index % 2 === 0 ? "张厨师" : "李安全",
      inspector: "李安全",
      operator: "李安全",
      operation_standard: "1",
      operation_result: "正常",
      result: "正常",
      check_result: "1",
      status: String(index % 3),
      waste_type: "厨余垃圾",
      weight: 12 + index,
      meal_type: "2",
      accompanying_meals: "2",
      inspection_type: "1",
      additive_category: "防腐剂",
      additive_name: "山梨酸钾",
      use_amount: "5g",
      image: imageData,
      images: imageData,
    })
  );
};

const makeWarningRows = (): Obj[] =>
  ["食材临期预警", "采购价格偏差", "库存不足", "月度价格异常"].map((name, index) =>
    common("warning", index, {
      name,
      title: name,
      warning_type: name,
      pro_name: ["牛肉", "番茄", "青菜", "豆腐"][index],
      pro_type_name: ["肉类", "蔬菜", "蔬菜", "豆制品"][index],
      supplier_name: index % 2 ? "校园鲜配" : "达州放心配送",
      count: 8 + index * 3,
      unit: "kg",
      level: index % 2 ? "重要" : "一般",
      handle_status: index % 2 ? "1" : "0",
      status: index % 2 ? "1" : "0",
      price: 420 + index * 100,
      guide_price: 390 + index * 80,
      diff_price: 30 + index * 20,
    })
  );

const makeStatisticsRows = (): Obj[] =>
  makeIngredientRows().map((row, index) => ({
    ...row,
    kind: "stat",
    id: `stat-${index + 1}`,
    date: dateList[index % dateList.length],
    in_count: 30 + index * 5,
    out_count: 16 + index * 3,
    old_count: 70 + index * 8,
    count: 84 + index * 6,
    in_money: 28000 + index * 5000,
    out_money: 16000 + index * 3500,
    old_money: 80000 + index * 9000,
    money: 96000 + index * 8800,
    settlePrice: 420 + index * 80,
    settle_price: 420 + index * 80,
    total_price: 32000 + index * 4500,
  }));

const makeSupervisionRows = (): Obj[] => [
  common("dailyPatrol", 0, { theme: "后厨每日巡检", unit_name: "第一中学食堂", inspection_time: `${today} 09:00`, inspector_name: "李安全", status: "0", list: templateItems("daily") }),
  common("dailyPatrol", 1, { theme: "餐具消毒巡检", unit_name: "第一中学食堂", inspection_time: "2026-06-22 09:30", inspector_name: "王库管", status: "1", list: templateItems("daily") }),
  common("monthlyPatrol", 0, { theme: "六月安全自查", unit_name: "第一中学食堂", inspection_time: `${today} 10:20`, inspector_name: "李安全", status: "0", list: templateItems("monthly") }),
  common("evaluation", 0, { theme: "校园食堂自查评价", censor: "优秀", score: "1", status: "1", list: templateItems("monthly") }),
  common("supervision", 0, { subject: "价格偏差督办", supervisor_name: "市场监管员", supervise_time: `${today} 14:00`, status: "0", content: "请核查牛肉采购价偏差。" }),
  common("complaint", 0, { title: "菜品口味反馈", content: "青菜偏咸，已反馈后厨。", reply_status: "1", status: "1" }),
];

const makeSystemRows = (): Obj[] => [
  common("notice", 0, { title: "端午节食品安全提醒", create_name: "演示管理员", content: "请做好食品留样、晨检和消毒记录。", publish_at: today }),
  common("notice", 1, { title: "本周菜单更新通知", create_name: "演示管理员", content: "本周新增番茄炒蛋、青菜豆腐汤等菜品。", publish_at: today }),
  common("device", 0, { device_id: "device-1", name: "粗加工间摄像头", device_name: "粗加工间摄像头", device_type: "camera", device_status: 1, status: 1, location: "粗加工间" }),
  common("device", 1, { device_id: "device-2", name: "留样柜温度计", device_name: "留样柜温度计", device_type: "thermometer", device_status: 1, status: 1, location: "留样间" }),
  common("shelve", 0, { pro_name: "低脂牛奶", measure_type: 2, status: 1, apply_user_name: "王库管", apply_time: `${today} 10:00`, handle_user_name: "演示管理员", handle_time: "", handle_remark: "待提交" }),
  common("shelve", 1, { pro_name: "全麦面包", measure_type: 1, status: 2, apply_user_name: "王库管", apply_time: "2026-06-22 10:00", handle_user_name: "演示管理员", handle_time: "", handle_remark: "待处理" }),
  common("semester", 0, { name: "2026 春季学期", semester_name: "2026 春季学期", date_start: "2026-02-18", date_end: "2026-07-10", status: "1" }),
];

const makeProcurementRows = (): Obj[] =>
  ["达州放心配送", "校园鲜配", "安心肉联"].map((supplier, index) =>
    common("procurement", index, {
      supplier_name: supplier,
      shop_name: supplier,
      pro_name: ["番茄", "青菜", "牛肉"][index],
      recipe_name: ["幼儿园春季营养食谱", "小学低年级一周食谱", "中学生高蛋白午餐"][index],
      meal_time: today,
      meal_info: [
        { meal_type: "0", total: 220 + index * 30 },
        { meal_type: "2", total: 360 + index * 40 },
      ],
      list: [
        { pro_name: "番茄", product_name: "番茄", supplier_name: supplier, count: 30, order_count: 36, unit: "kg" },
        { pro_name: "鸡蛋", product_name: "鸡蛋", supplier_name: supplier, count: 40, order_count: 48, unit: "kg" },
      ],
      total_price: 52000 + index * 9000,
      settlePrice: 52000 + index * 9000,
      status: index % 2 ? "已下单" : "待下单",
      task_id: `task-${index + 1}`,
    })
  );

const makeFinanceRows = (): Obj[] =>
  ["DZ-AR-202606-001", "DZ-AR-202606-002"].map((billNo, index) =>
    common("finance", index, {
      bill_no: billNo,
      supplier_name: index ? "校园鲜配" : "达州放心配送",
      receivable_amount: 98600 + index * 12400,
      received_amount: index ? 50000 : 98600,
      settlePrice: 98600 + index * 12400,
      status: index ? "待对账" : "已完成",
      statement_items: makeOrderRows()[0].list,
      list: makeOrderRows()[0].list,
    })
  );

const makeInventoryCheckRows = (): Obj[] => [
  common("inventoryCheck", 0, { id: "check-1", user_name: "Stock Keeper", user_phone: "13800000002", created_at: `${today} 15:10` }),
  common("inventoryCheck", 1, { id: "check-2", user_name: "Safety Admin", user_phone: "13800000001", created_at: "2026-06-22 16:20" }),
];

const makeFoodAdditiveRows = (): Obj[] =>
  [
    ["Tomato Sauce", "120", "Potassium Sorbate", "8", "Safety Admin"],
    ["Vegetable Mix", "80", "Tea Polyphenols", "5", "Chef Zhang"],
  ].map(([producetName, totalQuantity, additiveName, useage, recorder], index) =>
    common("foodAdditive", index, {
      producet_name: producetName,
      total_quantity: totalQuantity,
      additive_category: index === 0 ? "Preservative" : "Antioxidant",
      additive_name: additiveName,
      useage,
      recorder,
      use_date: `${today} ${String(9 + index).padStart(2, "0")}:20:00`,
      usage_status: "1",
      image: imageData,
    })
  );

const makeTablewareRows = (): Obj[] =>
  [
    ["Safety Admin", "1", "1,2,3", 260, "92", 45, "1,4"],
    ["Kitchen Assistant", "2", "4,5,6", 180, "88", 30, "2,4"],
  ].map(([operator, shiftType, disinfectItems, quantity, temperature, duration, methods], index) =>
    common("tableware", index, {
      operator,
      shift_type: shiftType,
      disinfect_time: `${today} ${String(10 + index).padStart(2, "0")}:00:00`,
      disinfect_items: disinfectItems,
      tableware_quantity: quantity,
      disinfect_temperature: temperature,
      disinfect_duration: duration,
      disinfect_methods: methods,
      image: imageData,
    })
  );

const makeFourPestRows = (): Obj[] =>
  [
    ["2026-06-23", "Health Disinfection Service", "Safety Admin", "1,2,3"],
    ["2026-06-18", "Campus Environment Service", "Stock Keeper", "2,4"],
  ].map(([date, company, operator, content], index) =>
    common("fourPest", index, {
      disinfection_date: date,
      disinfection_company: company,
      operator,
      disinfection_content: content,
      operation_standard: "1",
      construction_image: imageData,
      report_image: imageData,
    })
  );

const makeRows = (): Obj[] => [
  ...makeIngredientRows(),
  ...makeDishRows(),
  ...makeCateringRows(),
  ...makeRecipeRows(),
  ...makeStaffRows(),
  ...makeOrderRows(),
  ...makeInspectionRows(),
  ...makeWarningRows(),
  ...makeStatisticsRows(),
  ...makeSupervisionRows(),
  ...makeSystemRows(),
  ...makeProcurementRows(),
  ...makeFinanceRows(),
  ...makeInventoryCheckRows(),
  ...makeFoodAdditiveRows(),
  ...makeTablewareRows(),
  ...makeFourPestRows(),
];

const makeWeekRecipeList = () =>
  dateList.map(date => ({
    date,
    list: [
      { dish_id: "dish-1", dish_name: "番茄炒蛋", meal_types: "0" },
      { dish_id: "dish-2", dish_name: "土豆烧牛肉", meal_types: "2" },
      { dish_id: "dish-3", dish_name: "青菜豆腐汤", meal_types: "4" },
    ],
  }));

const templateItems = (type: "daily" | "monthly") => [
  { item: type === "daily" ? "环境卫生" : "食品安全制度", content: "地面、台面、工具清洁完好", status: "1", not_ok_desc: "", sort: 1 },
  { item: type === "daily" ? "人员晨检" : "台账记录", content: "从业人员体温、健康状态正常", status: "1", not_ok_desc: "", sort: 2 },
  { item: type === "daily" ? "留样管理" : "设施设备", content: "留样重量、时间、标签符合要求", status: "0", not_ok_desc: "演示整改项", sort: 3 },
];

const overview: Obj = {
  canteen_count: 3,
  canteen_info: { name: "第一中学食堂", org_name: "第一中学食堂", address: "达州市通川区校园路 88 号", meal_type: "早餐,午餐,晚餐" },
  license_info: { no: "JY35117010000123", expire_date: "2027-12-31", image: imageData },
  inventory_remind: { before_money: 328000, expired_money: 0, lack_list: [{ name: "牛肉", pro_name: "牛肉", count: 5, unit: "kg" }] },
  staff_list: makeStaffRows().map(row => ({ ...row, is_on_job: true, avatar: imageData })),
  self_check_summary: { normal_count: 2, abnormal_count: 1, unchecked_count: 2 },
  daily_manage_status: [{ name: "水电安全", status: "正常" }, { name: "燃气安全", status: "待整改" }, { name: "消防设备", status: "正常" }],
  device_online_count: 5,
  device_total_count: 6,
  today_order_count: 8,
  in_stock_today: 286000,
  out_stock_today: 194000,
  today_warning_count: 3,
  inventory_amount: 46200,
  warning_count: 4,
  pending_count: 6,
  purchase_amount: 128600,
  today_in_count: 12,
  today_out_count: 9,
};

const templates = {
  "1": { type: "1", name: "日管控模板", remark: "每日后厨管控巡检模板", list: templateItems("daily") },
  "0": { type: "0", name: "周排查模板", remark: "每周食品安全自查模板", list: templateItems("monthly") },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const initialDb = (): LocalDb => ({
  rows: makeRows(),
  users: [
    { ...demoUser },
    { ...demoUser, admin_id: "u-chef", id: "u-chef", account: "chef", nick: "张厨师", name: "张厨师", role_name: "厨师长" },
    { ...demoUser, admin_id: "u-stock", id: "u-stock", account: "stock", nick: "王库管", name: "王库管", role_name: "库管" },
  ],
  roles,
  orgTree,
  templates,
});

const loadDb = (): LocalDb => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore broken cache
  }
  const db = initialDb();
  saveDb(db);
  return db;
};

const saveDb = (db: LocalDb) => localStorage.setItem(STORE_KEY, JSON.stringify(db));

const ok = (data: any = {}, msg = "操作成功"): HttpResult => ({
  success: true,
  code: 200,
  msg,
  message: msg,
  data,
});

const flattenTree = (tree: Obj[]): Obj[] =>
  tree.flatMap(item => [item, ...flattenTree(Array.isArray(item.children) ? item.children : [])]);

const byKind = (db: LocalDb, kinds: string | string[]) => {
  const list = Array.isArray(kinds) ? kinds : [kinds];
  return db.rows.filter(row => list.includes(row.kind));
};

const pickRows = (url: string, db: LocalDb) => {
  if (url.includes("admin/list")) return db.users;
  if (url.includes("role")) return db.roles;
  if (url.includes("org") || url.includes("district") || url.includes("restaurant") || url.includes("catering-units")) return flattenTree(db.orgTree);
  if (url.includes("notice")) return byKind(db, "notice");
  if (url.includes("device")) return byKind(db, "device");
  if (url.includes("pending-receipt")) return byKind(db, "order").filter(row => row.receipt_status !== "done");
  if (url.includes("page-receipted")) return byKind(db, "order").filter(row => row.receipt_status === "done");
  if (url.includes("order") || url.includes("confirm") || url.includes("traceability")) return byKind(db, "order");
  if (url.includes("shelve")) return byKind(db, "shelve");
  if (url.includes("inventory/inoutrecord") || url.includes("inventory/outrecord")) return byKind(db, ["ingredient", "order"]);
  if (url.includes("inventory/check-list")) return byKind(db, "inventoryCheck");
  if (url.includes("inventory/checkinfo-list") || url.includes("inventory/check") || url.includes("stocktake-summary")) return byKind(db, "stat");
  if (url.includes("statistics") || url.includes("procurementcosts")) return byKind(db, ["stat", "procurement"]);
  if (url.includes("warn") || url.includes("alarm") || url.includes("price")) return byKind(db, "warning");
  if (url.includes("page-ingredient") || url.includes("inventory") || url.includes("batch") || url.includes("category")) return byKind(db, "ingredient");
  if (url.includes("page-dish") || url.includes("get-dish")) return byKind(db, "dish");
  if (url.includes("catering-objects")) return byKind(db, "catering");
  if (url.includes("page-recipe") || url.includes("list-recipe") || url.includes("get-recipe")) return byKind(db, "recipe");
  if (url.includes("practitioners")) return byKind(db, "staff");
  if (url.includes("recipe-volume") || url.includes("procurementcosts")) return byKind(db, "procurement");
  if (url.includes("questionnaire") || url.includes("student-parent") || url.includes("activity")) return byKind(db, ["catering", "staff", "procurement"]);
  if (url.includes("food-additive-useage")) return byKind(db, "foodAdditive");
  if (url.includes("tableware-disinfection")) return byKind(db, "tableware");
  if (url.includes("four-pest-disinfection")) return byKind(db, "fourPest");
  if (url.includes("inspection/")) return byKind(db, "inspection");
  if (url.includes("daily-inspcetion")) return byKind(db, "dailyPatrol");
  if (url.includes("monthly-inspcetion") || url.includes("apprais")) return byKind(db, ["monthlyPatrol", "evaluation"]);
  if (url.includes("supervise") || url.includes("complaints")) return byKind(db, ["supervision", "complaint"]);
  if (url.includes("finance/receivable")) return byKind(db, "finance");
  if (url.includes("semester")) return byKind(db, "semester");
  return db.rows;
};

const findId = (data: Obj = {}) =>
  data.id || data.admin_id || data.role_id || data.org_id || data.order_id || data.bill_id || data.device_id || data.record_id || data.uuid;

const fallbackValue = (key: string, row: Obj, index: number) => {
  const name = row.name || row.title || row.pro_name || row.product_name || row.recipe_name || row.theme || `演示数据${index + 1}`;
  const textMap: Obj = {
    name,
    title: name,
    pro_name: row.pro_name || name,
    product_name: row.product_name || row.pro_name || name,
    ingredient_name: row.ingredient_name || row.pro_name || name,
    recipe_name: row.recipe_name || name,
    object_name: row.object_name || "小学低年级",
    category: row.category || "3",
    category_name: row.category_name || row.pro_type_name || "蔬菜",
    pro_type_name: row.pro_type_name || row.category_name || "蔬菜",
    pro_type_pname: row.pro_type_pname || row.pro_type_name || "蔬菜",
    specification: row.specification || "散称",
    supplier_name: row.supplier_name || row.shop_name || "达州放心配送",
    shop_name: row.shop_name || row.supplier_name || "达州放心配送",
    org_name: row.org_name || "第一中学食堂",
    canteen_name: row.canteen_name || "第一中学食堂",
    unit_name: row.unit_name || "第一中学食堂",
    creator: row.creator || "演示管理员",
    create_name: row.create_name || "演示管理员",
    operator: row.operator || "李安全",
    inspector_name: row.inspector_name || "李安全",
    supervisor_name: row.supervisor_name || "市场监管员",
    role_name: row.role_name || "食堂管理员",
    phone: row.phone || "13800000000",
    mobile: row.mobile || row.phone || "13800000000",
    pro_no: row.pro_no || `NO-${String(index + 1).padStart(4, "0")}`,
    order_no: row.order_no || `PS20260623${String(index + 1).padStart(3, "0")}`,
    batch_no: row.batch_no || `B20260623${String(index + 1).padStart(3, "0")}`,
    address: row.address || row.shipping_address || "食堂后门收货区",
    shipping_address: row.shipping_address || row.address || "食堂后门收货区",
    content: row.content || `${name}演示内容`,
    remark: row.remark || "本地演示备注",
    item: row.item || "环境卫生",
    result: row.result || "正常",
    check_result: row.check_result || "1",
    status: row.status ?? "1",
    handle_status: row.handle_status ?? "0",
    unit: row.unit || "kg",
    date: row.date || today,
    created_at: row.created_at || `${today} 09:00`,
    create_time: row.create_time || row.created_at || `${today} 09:00`,
    updated_at: row.updated_at || `${today} 10:00`,
    inspection_time: row.inspection_time || `${today} 09:30`,
    meal_time: row.meal_time || today,
    date_start: row.date_start || "2026-06-22",
    date_end: row.date_end || "2026-06-28",
    image: row.image || imageData,
    image_url: row.image_url || imageData,
    images: row.images || imageData,
    pro_cover: row.pro_cover || imageData,
  };
  if (key in textMap) return textMap[key];
  if (/count|total|amount|money|price|weight|quantity|number|score/i.test(key)) return row[key] ?? 12 + index;
  if (/time|date/.test(key)) return row[key] ?? `${today} 09:00`;
  return row[key] ?? "";
};

const normalizeRow = (row: Obj, index = 0) => {
  const keys = [
    "name", "title", "pro_name", "product_name", "ingredient_name", "recipe_name", "object_name", "category", "category_name",
    "pro_type_name", "pro_type_pname", "specification", "supplier_name", "shop_name", "org_name", "canteen_name", "unit_name",
    "creator", "create_name", "operator", "inspector_name", "supervisor_name", "role_name", "phone", "mobile", "pro_no",
    "order_no", "batch_no", "address", "shipping_address", "content", "remark", "item", "result", "check_result", "status",
    "handle_status", "unit", "date", "created_at", "create_time", "updated_at", "inspection_time", "meal_time", "date_start",
    "date_end", "image", "image_url", "images", "pro_cover", "count", "old_count", "in_count", "out_count", "money", "old_money",
    "in_money", "out_money", "guide_price", "in_guide_price", "out_guide_price", "price", "amount", "measure_type", "goods_total",
  ];
  const item = { ...row };
  keys.forEach(key => {
    item[key] = fallbackValue(key, item, index);
  });
  item.id = item.id || `${item.kind || "row"}-${index + 1}`;
  item.list = Array.isArray(item.list) ? item.list : [];
  item.items = Array.isArray(item.items) ? item.items : item.list;
  return item;
};

const paginate = (rows: Obj[], query: Obj = {}) => {
  const page = Number(query.page || query.current || 1);
  const size = Number(query.size || query.page_size || query.limit || 20);
  const keyword = String(query.keyword || query.name || query.pro_name || query.recipe_name || query.theme || query.search || "").trim();
  const filtered = rows.filter(row => !keyword || JSON.stringify(row).includes(keyword));
  const start = (page - 1) * size;
  const list = filtered.slice(start, start + size).map((row, index) => normalizeRow(clone(row), start + index));
  const total = filtered.length;
  return {
    list,
    rows: list,
    items: list,
    total,
    count: total,
    page,
    size,
    page_size: size,
    device_list: list,
    category_list: list,
    ingredient_list: list,
    order_list: list,
  };
};

const upsertRow = (db: LocalDb, data: Obj = {}, url = "") => {
  const kind = getKindFromUrl(url);
  const id = findId(data) || `${kind}-${Date.now()}`;
  const row = normalizeRow({ kind, id, [`${kind}_id`]: id, ...data }, 0);
  const targetList = url.includes("admin/") ? db.users : url.includes("role") ? db.roles : db.rows;
  const index = targetList.findIndex((item: Obj) => findId(item) === id || item.id === id);
  if (index >= 0) targetList[index] = { ...targetList[index], ...row };
  else targetList.unshift(row);
  saveDb(db);
  return row;
};

const removeRow = (db: LocalDb, data: Obj = {}) => {
  const ids = [findId(data), ...(Array.isArray(data.ids) ? data.ids : [])].filter(Boolean);
  db.rows = db.rows.filter(row => !ids.includes(findId(row)) && !ids.includes(row.id));
  db.users = db.users.filter(row => !ids.includes(findId(row)) && !ids.includes(row.id));
  db.roles = db.roles.filter(row => !ids.includes(findId(row)) && !ids.includes(row.id));
  saveDb(db);
};

const getKindFromUrl = (url: string) => {
  if (url.includes("dish")) return "dish";
  if (url.includes("food-additive-useage")) return "foodAdditive";
  if (url.includes("tableware-disinfection")) return "tableware";
  if (url.includes("four-pest-disinfection")) return "fourPest";
  if (url.includes("inventory/check-list")) return "inventoryCheck";
  if (url.includes("ingredient") || url.includes("inventory")) return "ingredient";
  if (url.includes("catering-objects")) return "catering";
  if (url.includes("recipe")) return "recipe";
  if (url.includes("practitioners")) return "staff";
  if (url.includes("shelve")) return "shelve";
  if (url.includes("inspection")) return "inspection";
  if (url.includes("supervision")) return "supervision";
  if (url.includes("notice")) return "notice";
  if (url.includes("device")) return "device";
  if (url.includes("role")) return "role";
  if (url.includes("admin")) return "user";
  return "row";
};

const makeTrend = () =>
  dateList.map((date, index) => ({ date, in_count: 20 + index * 3, out_count: 12 + index * 2, amount: 3000 + index * 420 }));

const purchaseSuggestion = (name = "") =>
  makeProcurementRows()
    .flatMap(row =>
      row.list.map((item: Obj, index: number) => ({
        ...item,
        id: `${row.id}-${index}`,
        supplier_id: row.id,
        supplier_name: row.supplier_name,
        recipe_name: row.recipe_name,
        pro_no: item.pro_no || `SC-REC-${index + 1}`,
        specification: item.specification || "鏁ｇО",
        measure_type: item.measure_type || 2,
      }))
    )
    .filter(item => !name || JSON.stringify(item).includes(name));

const special = (url: string, data: Obj, db: LocalDb) => {
  if (url.includes("/image")) return ok({ image: imageData, captcha_id: "captcha-local" }, "验证码获取成功");
  if (url.includes("/sms")) return ok({ code: "123456" }, "短信验证码已发送");
  if (url.includes("/login") || url.includes("/sms-login") || url.includes("/tokenlogin")) return ok({ ...clone(demoUser), token: "local-demo-token" }, "登录成功");
  if (url.includes("/logout")) return ok({}, "退出成功");
  if (url.includes("/auth/userinfo")) return ok(Storage.get("SystemUserinfo") || demoUser);
  if (url.includes("/config/info")) return ok({ key: data.key, value: data.key === "SystemLogo" ? "" : "食安管理系统" });
  if (url.includes("/role/rules")) return ok({ list: permissionRules });
  if (url.includes("/role/dict")) return ok({ list: db.roles, total: db.roles.length });
  if (url.includes("/device/types")) return ok({ list: [{ name: "摄像头", value: "camera" }, { name: "温度计", value: "thermometer" }, { name: "标签打印机", value: "printer" }] });
  if (url.includes("district/tree") || url.includes("org/tree") || url.includes("div/tree")) return ok({ list: clone(db.orgTree), total: db.orgTree.length });
  if (url.includes("org/list") || url.includes("unit/list-catering-units")) return ok({ list: flattenTree(db.orgTree), total: flattenTree(db.orgTree).length });
  if (url.includes("/home/overview")) return ok(overview);
  if (url.includes("inventory-warn-trend")) return ok({ list: makeTrend() });
  if (url.includes("expired-warn-money")) return ok({ amount: 3200, money: 3200, total: 3200 });
  if (url.includes("get-current-week-recipe")) return ok(normalizeRow(byKind(db, "recipe")[0], 0));
  if (url.includes("recipe-analysis")) return ok({
    add_recipe_trend: dateList.map((date, index) => ({ date, count: 2 + index })),
    recipe_score: [0, 1, 2, 3, 4].map((score, index) => ({ score, count: [2, 5, 4, 1, 0][index] })),
    add_recipe_count: [{ type: 0, count: 18 }, { type: 1, count: 2 }],
    dish_type: [0, 1, 2, 3, 4, 5].map((type, index) => ({ type, count: [6, 4, 5, 12, 10, 8][index] })),
  });
  if (url.includes("get-recipe-volume-suggestion-detail") || url.includes("get-recipe-volume-suggestion")) return ok({ suggestion: purchaseSuggestion(data.name || "") });
  if (url.includes("save-recipe-volume")) return ok({ id: data.id || `volume-${Date.now()}` });
  if (url.includes("reorder-recipe-volume")) return ok({});
  if (url.includes("get-recipe-volume-suggestion-order-info")) return ok({
    list: makeProcurementRows().map(row => ({ supplier_id: row.id, supplier_name: row.supplier_name, status: 1 })),
  });
  if (url.includes("inspection-template")) {
    const type = String(data.type ?? "1");
    if (url.includes("list-inspection-template-categories")) {
      return ok({ list: templateItems(type === "1" ? "daily" : "monthly").map(item => ({ name: item.item, value: item.item })) });
    }
    if (url.includes("merge-inspection-template")) {
      db.templates[type] = { ...data };
      saveDb(db);
      return ok(db.templates[type]);
    }
    return ok(db.templates[type] || templates["1"]);
  }
  if (url.includes("export") || url.includes("import")) return ok({ task_id: `task-${Date.now()}`, url: imageData });
  if (url.includes("task/get-task-info")) return ok({ status: 2, progress: 100, url: imageData, file_name: "本地演示数据.xlsx" });
  if (url.includes("auth") && url.includes("video")) return ok({ token: "local-video-token" });
  if (url.includes("submit-order") || url.includes("confirm-order")) {
    const target = db.rows.find(row => row.order_id === data.order_id || row.id === data.order_id || row.id === data.id);
    if (target) {
      target.receipt_status = "done";
      target.status = 2;
      target.list = data.items || data.list || target.list;
      saveDb(db);
    }
    return ok(target || {});
  }
  if (url.includes("reconciliation")) return ok({ ...normalizeRow(byKind(db, "finance")[0], 0), status: "已完成" });
  return null;
};

export async function localRequest(config: MockConfig): Promise<HttpResult> {
  const db = loadDb();
  const url = String(config.url || "");
  const data = config.data || config.params || {};
  const method = String(config.method || "GET").toUpperCase();
  const specialResult = special(url, data, db);
  if (specialResult) return specialResult;

  if (/\/page-|\/list|\/check-list|record-list|pending-receipt|page-receipted/.test(url)) {
    return ok(paginate(pickRows(url, db), data));
  }

  if (url.includes("/get") || url.includes("/info") || url.includes("/detail")) {
    const rows = pickRows(url, db);
    const id = findId(data);
    const row = rows.find(item => findId(item) === id || item.id === id) || rows[0] || {};
    return ok(normalizeRow(clone(row), 0));
  }

  if (["POST", "PUT", "PATCH"].includes(method) && /create|add|edit|update|merge|save|submit|handle|review|sign|inhouse|outhouse|check|draft|process|censor|print|refresh|reorder/.test(url)) {
    return ok(upsertRow(db, data, url));
  }

  if (method === "DELETE" || /delete|destroy|resign/.test(url)) {
    removeRow(db, data);
    return ok({});
  }

  return ok(paginate(pickRows(url, db), data));
}

export const localUploadResponse = (name = "本地上传文件") => ({
  code: 200,
  msg: "上传成功",
  data: {
    url: imageData,
    name,
  },
});
