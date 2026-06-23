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

const STORE_KEY = "canteen-web-local-db-v14";
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
const dateList = ["2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27", "2026-06-28"];
const weekNameList = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const firstProjectId = "org-project-wuhou";
const firstCanteenId = "org-canteen-wuhou-1";
const firstCanteenName = "武侯区第一食堂";

const PASSWORD_123456 = "601eeaedd7e52357c6316f0f1e85e6bf";
const PASSWORD_ADMIN = "a395926836cdfcc18a8d3165aa205df7";
const ROLE = {
  platformAdmin: "role-platform-admin",
  projectManager: "role-project-manager",
  canteenManager: "role-canteen-manager",
  chefLead: "role-chef-lead",
  safety: "role-safety",
  stock: "role-stock",
  firstPost: "role-first-post",
};
const projectManagerRules =
  "home,canteen_manage,dish_pool,catering_objects,weekly_recipe,recipe_pool,purchase_recommend,employee_manage,food_inventory,inventory_manage,received_confirm,inventory_record,outbound_record,inventory_check,statistical_report,inventory_report,outbound_report,inventory_check_report,purchase_costs_statistics,warn_manage,food_expire_warn,certificate_expire_warn,video_warn,food_safety_manage,food_sample,quarantine_detection,morning_check,cleaning_record,environment_sanitization_record,tableware_sanitization_record,four_pest_control_record,safety_self_check,disposal_report,additive_use_record,meal_record,parity_record,light_cooking,co_governance,day_control,weekly_check,month_dispatch,inspection_template,canteen_user_manage,device_manage,attendance_manage,attendance_schedule,attendance_records,leave_application";

const roles: Obj[] = [
  { id: ROLE.platformAdmin, role_id: ROLE.platformAdmin, code: "platform_admin", role_code: "platform_admin", name: "平台管理员", role_name: "平台管理员", group: "系统管理", rule: fullRule, hidden: true, remark: "平台内置账号" },
  { id: ROLE.projectManager, role_id: ROLE.projectManager, code: "project_manager", role_code: "project_manager", name: "项目经理", role_name: "项目经理", group: "人员管理", rule: projectManagerRules, remark: "项目及人员管理" },
  { id: ROLE.canteenManager, role_id: ROLE.canteenManager, code: "canteen_manager", role_code: "canteen_manager", name: "食堂经理", role_name: "食堂经理", group: "人员管理", rule: projectManagerRules, remark: "食堂及人员管理" },
  { id: ROLE.chefLead, role_id: ROLE.chefLead, code: "chef_lead", role_code: "chef_lead", name: "厨师长", role_name: "厨师长", group: "食堂管理", rule: "home,canteen_manage,dish_pool,catering_objects,weekly_recipe,recipe_pool,purchase_recommend", remark: "菜品、食谱与推荐量" },
  { id: ROLE.safety, role_id: ROLE.safety, code: "safety", role_code: "safety", name: "安全员", role_name: "安全员", group: "食安管理", rule: "home,warn_manage,food_expire_warn,certificate_expire_warn,video_warn,food_safety_manage,food_sample,quarantine_detection,morning_check,cleaning_record,environment_sanitization_record,tableware_sanitization_record,four_pest_control_record,safety_self_check,disposal_report,additive_use_record,meal_record,parity_record,light_cooking", remark: "食安台账与预警" },
  { id: ROLE.stock, role_id: ROLE.stock, code: "stock", role_code: "stock", name: "库管", role_name: "库管", group: "库存管理", rule: "home,food_inventory,inventory_manage,received_confirm,inventory_record,outbound_record,inventory_check,statistical_report,inventory_report,outbound_report,inventory_check_report,purchase_costs_statistics", remark: "库存、签收与报表" },
  { id: ROLE.firstPost, role_id: ROLE.firstPost, code: "first_post", role_code: "first_post", name: "一级岗位", role_name: "一级岗位", group: "基础岗位", rule: "home,canteen_manage,food_inventory,food_safety_manage,warn_manage,food_expire_warn,certificate_expire_warn,video_warn", remark: "一线岗位操作" },
];

const makeOrg = (id: string, name: string, orgType: string, parentId = "", children: Obj[] = []): Obj => {
  const unitAttr = orgType === "canteen" ? "8" : orgType === "project" ? "4" : "2";
  const typeName = orgType === "canteen" ? "食堂" : orgType === "project" ? "项目" : "公司";
  return {
    org_id: id,
    id,
    value: id,
    pid: parentId,
    parent_id: parentId,
    org_name: name,
    name,
    label: name,
    org_type: orgType,
    org_type_name: typeName,
    unit_attr: unitAttr,
    unit_attr_name: typeName,
    code: id.toUpperCase().replace(/-/g, "_"),
    city_id: "510100",
    city_name: "成都市",
    area_name: name.includes("武侯") ? "武侯区" : name.includes("锦江") ? "锦江区" : name.includes("金牛") ? "金牛区" : name.includes("青羊") ? "青羊区" : "成都市",
    address: `${name}地址`,
    legal_person: orgType === "company" ? "周总" : orgType === "project" ? "项目负责人" : "食堂负责人",
    contact_name: orgType === "canteen" ? "食堂负责人" : "组织负责人",
    contact_phone: "13800000000",
    icon_url: imageData,
    business_license_no: orgType === "canteen" ? `JY${id.replace(/\D/g, "").padEnd(12, "0")}` : "",
    business_license_image: imageData,
    business_license_expire_date: "2027-12-31",
    license_image: imageData,
    independent: orgType === "canteen" ? "1" : "",
    children,
  };
};

const makeSchools = (area: string, parentId: string) =>
  ["第一食堂", "第二食堂", "第三食堂"].map((suffix, index) =>
    makeOrg(`org-canteen-${area}-${index + 1}`, `${area}区${suffix}`, "canteen", parentId)
  );

const orgTree: Obj[] = [
  makeOrg("org-company-zlzh", "中链智汇团餐公司", "company", "", [
    makeOrg("org-project-wuhou", "成都武侯区项目", "project", "org-company-zlzh", makeSchools("武侯", "org-project-wuhou")),
    makeOrg("org-project-jinjiang", "成都锦江区项目", "project", "org-company-zlzh", makeSchools("锦江", "org-project-jinjiang")),
    makeOrg("org-project-jinniu", "成都金牛区项目", "project", "org-company-zlzh", makeSchools("金牛", "org-project-jinniu")),
    makeOrg("org-project-qingyang", "成都青羊区项目", "project", "org-company-zlzh", makeSchools("青羊", "org-project-qingyang")),
  ]),
];

const permissionRules: Obj[] = [
  { id: "m-home", pid: "", title: "总览", name: "总览", rule: "home", group: "基础" },
  { id: "m-canteen", pid: "", title: "食堂管理", name: "食堂管理", rule: "canteen_manage", group: "食堂管理" },
  { id: "m-store", pid: "", title: "食材库存", name: "食材库存", rule: "food_inventory", group: "库存管理" },
  { id: "m-report", pid: "", title: "统计报表", name: "统计报表", rule: "statistical_report", group: "统计报表" },
  { id: "m-warning", pid: "", title: "预警管理", name: "预警管理", rule: "warn_manage", group: "预警管理" },
  { id: "m-safety", pid: "", title: "食安管理", name: "食安管理", rule: "food_safety_manage", group: "食安管理" },
  { id: "m-supervision", pid: "", title: "共治监管", name: "共治监管", rule: "supervision_manage", group: "共治监管" },
  { id: "m-attendance", pid: "", title: "考勤管理", name: "考勤管理", rule: "attendance_manage", group: "考勤管理" },
  { id: "m-system", pid: "", title: "系统管理", name: "系统管理", rule: "org_manage", group: "系统管理" },
].map(item => ({ ...item, label: item.title || item.name, value: item.rule }));

const common = (kind: string, index: number, extra: Obj = {}): Obj => ({
  kind,
  id: `${kind}-${index + 1}`,
  [`${kind}_id`]: `${kind}-${index + 1}`,
  org_id: firstCanteenId,
  org_name: firstCanteenName,
  canteen_name: firstCanteenName,
  unit_name: firstCanteenName,
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

const dishIngredientIndexes = [
  [0, 1],
  [2, 3],
  [4, 5],
  [1, 3],
];
const dishIngredientUsages = [
  [80, 45],
  [90, 65],
  [70, 55],
  [50, 60],
];
const makeDishIngredients = (dishIndex: number): Obj[] => {
  const ingredients = makeIngredientRows();
  return dishIngredientIndexes[dishIndex % dishIngredientIndexes.length].map((ingredientIndex, index) => {
    const ingredient = ingredients[ingredientIndex] || ingredients[index] || {};
    const quantity = dishIngredientUsages[dishIndex % dishIngredientUsages.length][index] || 50;
    return {
      id: ingredient.id,
      ingredient_id: ingredient.id,
      name: ingredient.name,
      ingredient_name: ingredient.pro_name || ingredient.name,
      pro_name: ingredient.pro_name || ingredient.name,
      product_name: ingredient.product_name || ingredient.pro_name || ingredient.name,
      pro_no: ingredient.pro_no,
      specification: ingredient.specification,
      unit: ingredient.unit || "kg",
      measure_type: ingredient.measure_type || 2,
      count: ingredient.count || 0,
      quantity,
      usage_count: quantity,
      usage_text: `${quantity}g/份`,
      supplier_id: `procurement-${(index % 3) + 1}`,
      supplier_name: ingredient.supplier_name,
    };
  });
};

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
      ingedients: makeDishIngredients(index),
      ingredient_list: makeDishIngredients(index),
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
      status: index === 0 ? "doing" : "done",
      status_name: index === 0 ? "进行中" : "已完成",
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
    ["张厨师", "厨师长", ROLE.chefLead, "u-canteen-manager", "测试食堂管理员"],
    ["李安全", "安全员", ROLE.safety, "u-canteen-manager", "测试食堂管理员"],
    ["王库管", "库管", ROLE.stock, "u-canteen-manager", "测试食堂管理员"],
    ["赵帮厨", "一级岗位", ROLE.firstPost, "u-chef-lead", "张厨师"],
    ["钱切配", "一级岗位", ROLE.firstPost, "u-safety", "李安全"],
    ["孙面点", "一级岗位", ROLE.firstPost, "u-stock", "王库管"],
  ].map(([name, roleName, roleId, superiorId, superiorName], index) =>
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
      role: roleId,
      role_id: roleId,
      role_name: roleName,
      superior_id: superiorId,
      superior_name: superiorName,
      user_avatar_uri: imageData,
      health_cert: imageData,
      health_cert_expire_date: "2026-12-31",
      health_cert_status: index === 3 ? "expiring" : "normal",
      no_criminal_cert: imageData,
      certificate: imageData,
      health_certificate_no: `JK20260${index + 1}`,
      health_certificate_expire_at: "2026-12-31",
      entry_time: "2025-09-01",
      status: "0",
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
      { id: "oi-1", product_name: "番茄", ingredient_name: "番茄", category_name: "蔬菜", count: 30, send_count: 30, received_count: 30, unit: "kg", price: 420, settle_price: 420, sign_status: "pending" },
      { id: "oi-2", product_name: "牛肉", ingredient_name: "牛肉", category_name: "肉类", count: 18, send_count: 18, received_count: 18, unit: "kg", price: 5600, settle_price: 5600, sign_status: "pending" },
      { id: "oi-3", product_name: "豆腐", ingredient_name: "豆腐", category_name: "豆制品", count: 20, send_count: 20, received_count: 20, unit: "kg", price: 380, settle_price: 380, sign_status: "pending" },
    ],
  }),
  common("order", 1, {
    id: "order-2",
    order_id: "order-2",
    order_no: "PS20260622008",
    shop_name: "校园鲜配",
    supplier_name: "校园鲜配",
    shipping_address: `${firstCanteenName}验收区`,
    address: `${firstCanteenName}验收区`,
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
      sample_pepeole: index % 2 === 0 ? "张厨师" : "李安全",
      personnel_name: index % 2 === 0 ? "张厨师" : "李安全",
      inspector: "李安全",
      inspector_position: "食品安全员",
      operator: "李安全",
      recorder: "李安全",
      operation_standard: "1",
      operation_result: "正常",
      result: "正常",
      check_result: "1",
      status: String(index % 3),
      clean_time: `${today} 08:20`,
      disinfect_time: `${today} 08:40`,
      disinfection_time: `${today} 09:10`,
      disinfection_type: "1",
      disinfection_duration: 30,
      disposal_time: `${today} 17:20`,
      waste_type: "厨余垃圾",
      waste_volume: 12 + index,
      recipient: "达州环卫服务",
      recipient_qualifications: "1",
      weight: 12 + index,
      meal_type: "2",
      accompanying_meals: "2",
      accompanying: "2",
      companion: "李爱国",
      companion_position: "家长代表",
      waiter: "赵帮厨",
      inspection_type: "1",
      detection_time: `${today} 07:50`,
      detector: "李安全",
      detection_value: "0.2",
      detection_result: "正常",
      fever: "0",
      sore_throat: "0",
      vomiting: "0",
      skin_infections: "0",
      dress: "1",
      handling_opinions: "1",
      additive_category: "防腐剂",
      additive_name: "山梨酸钾",
      use_amount: "5g",
      kitchen: "1",
      doors: "1",
      tool: "1",
      garbage: "1",
      stored: "1",
      wipe: "1",
      water: "1",
      gas: "1",
      fire_fighting: "1",
      tested: "番茄",
      inspection_evaluation: "符合要求",
      appraise: "菜品温度、口味正常",
      handlers: "王库管",
      handle_time: `${today} 19:00`,
      can_destroy: index % 2 === 0,
      image: imageData,
      images: imageData,
    })
  );
};

const makeFoodRetentionRows = (): Obj[] => [
  common("inspection", 0, {
    id: "food-retention-1",
    sample_name: "番茄炒蛋",
    sample_pepeole: "张厨师",
    sample_time: `${today} 11:30:00`,
    sample_meal_types: "2",
    sample_weight: 125,
    status: "0",
    handlers: "",
    handle_time: "",
    can_destroy: true,
  }),
  common("inspection", 1, {
    id: "food-retention-2",
    sample_name: "青菜豆腐汤",
    sample_pepeole: "李安全",
    sample_time: "2026-06-21 12:00:00",
    sample_meal_types: "2,4",
    sample_weight: 130,
    status: "1",
    handlers: "王库管",
    handle_time: `${today} 09:00:00`,
    can_destroy: false,
  }),
];

const makeMorningInspectionRows = (): Obj[] => [
  common("inspection", 0, {
    id: "morning-1",
    inspection_time: `${today} 07:40:00`,
    personnel_name: "张厨师",
    name: "张厨师",
    fever: "0",
    sore_throat: "0",
    vomiting: "0",
    skin_infections: "0",
    dress: "1",
    handling_opinions: "1",
  }),
  common("inspection", 1, {
    id: "morning-2",
    inspection_time: `${today} 07:46:00`,
    personnel_name: "李安全",
    name: "李安全",
    fever: "0",
    sore_throat: "0",
    vomiting: "0",
    skin_infections: "0",
    dress: "1",
    handling_opinions: "1",
  }),
];

const makeCleaningRecordRows = (): Obj[] => [
  common("inspection", 0, {
    id: "cleaning-1",
    operator: "李安全",
    clean_time: `${today} 08:20:00`,
    region: "3",
    stored: "1",
    wipe: "1",
    tool: "1",
    garbage: "1",
  }),
  common("inspection", 1, {
    id: "cleaning-2",
    operator: "王库管",
    clean_time: `${today} 13:40:00`,
    region: "5",
    stored: "1",
    wipe: "1",
    tool: "1",
    garbage: "1",
  }),
];

const makeSafetyInspectionRows = (): Obj[] => [
  common("inspection", 0, {
    id: "safety-1",
    operator: "李安全",
    inspection_time: `${today} 09:30:00`,
    region: "4",
    water: "1",
    gas: "1",
    doors: "1",
    kitchen: "1",
    fire_fighting: "1",
  }),
  common("inspection", 1, {
    id: "safety-2",
    operator: "张厨师",
    inspection_time: `${today} 16:10:00`,
    region: "6",
    water: "1",
    gas: "1",
    doors: "1",
    kitchen: "1",
    fire_fighting: "1",
  }),
];

const makeWarningRows = (): Obj[] =>
  ["食材临期预警", "证件过期预警", "视频预警", "库存不足"].flatMap((name, index) =>
    (index === 2 ? ["未规范着装", "未戴口罩", "人员离灶", "老鼠"] : [""]).map((videoItem, videoIndex) =>
    common("warning", index === 2 ? index + videoIndex : index, {
      name,
      title: name,
      subject: index === 2 ? `视频预警-${videoItem}` : name,
      warning_type: name,
      warn_category: ["food_expire", "certificate", "video", "stock"][index],
      pro_name: ["牛肉", "番茄", "青菜", "豆腐"][index],
      pro_type_name: ["肉类", "蔬菜", "蔬菜", "豆制品"][index],
      supplier_name: index % 2 ? "校园鲜配" : "达州放心配送",
      in_batch_no: `B2026062${index + 1}`,
      in_time: `${today} ${String(8 + index).padStart(2, "0")}:10`,
      end_time: `2026-07-0${index + 1} 23:59`,
      month: "202606",
      expired_day: 7 + index,
      count: 8 + index * 3,
      unit_weight: 500,
      unit: "kg",
      level: index % 2 ? "重要" : "一般",
      handle_status: index % 2 ? "1" : "0",
      status: index % 2 ? "1" : "0",
      price: 420 + index * 100,
      area_price: 390 + index * 80,
      now_price: 440 + index * 90,
      last_month_price: 400 + index * 70,
      guide_price: 390 + index * 80,
      diff_price: 30 + index * 20,
      do_remark: "已核对采购台账",
      staff_name: index === 1 ? "张厨师" : "",
      certificate_name: index === 1 ? "健康证" : "",
      certificate_expire_date: index === 1 ? "2026-07-18" : "",
      warning_item: index === 2 ? videoItem : "",
      camera_name: index === 2 ? ["后厨操作间摄像头", "备餐间摄像头", "灶台摄像头", "仓库入口摄像头"][videoIndex] : "",
      snapshot_time: index === 2 ? `${today} 10:18` : "",
      alarm_desc:
        index === 1
          ? "从业人员健康证将在30天内到期，请及时更新证件。"
          : index === 2
            ? `视频识别到${videoItem}，请及时核查处理。`
            : `${name}演示说明`,
      alarm_files: imageData,
      process_desc: "已完成核实处理",
      process_files: imageData,
      processor_name: "王库管",
      processor_time: `${today} 16:20`,
      supervise_time: `${today} 14:00`,
      supervisor_name: "市场监管员",
    }))
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
  common("dailyPatrol", 0, { theme: "后厨每日巡检", unit_name: firstCanteenName, inspection_time: `${today} 09:00`, inspector_name: "李安全", status: "0", list: templateItems("daily") }),
  common("dailyPatrol", 1, { theme: "餐具消毒巡检", unit_name: firstCanteenName, inspection_time: "2026-06-22 09:30", inspector_name: "王库管", status: "1", list: templateItems("daily") }),
  common("monthlyPatrol", 0, { theme: "六月安全自查", unit_name: firstCanteenName, inspection_time: `${today} 10:20`, inspector_name: "李安全", status: "0", list: templateItems("monthly") }),
  common("evaluation", 0, { theme: "校园食堂自查评价", censor: "优秀", score: "1", status: "1", list: templateItems("monthly") }),
  common("supervision", 0, {
    subject: "价格偏差督办",
    supervisor_name: "市场监管员",
    supervise_time: `${today} 14:00`,
    alarm_desc: "请核查牛肉采购价偏差。",
    alarm_files: imageData,
    process_desc: "已确认台账并完成整改",
    process_files: imageData,
    processor_name: "王库管",
    processor_time: `${today} 16:20`,
    status: "0",
    content: "请核查牛肉采购价偏差。",
  }),
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

const normalizeFinanceBill = (bill: Obj = {}, index = 0) => ({
  ...bill,
  period_start: bill.period_start || (index ? "2026-06-16" : "2026-06-01"),
  period_end: bill.period_end || (index ? "2026-06-22" : "2026-06-15"),
  customer_name: bill.customer_name || bill.school_name || displayOrgForIndex(index).org_name,
  school_name: bill.school_name || bill.customer_name || displayOrgForIndex(index).org_name,
  distributor_name: bill.distributor_name || bill.supplier_name || (index ? "校园鲜配" : "达州放心配送"),
  supplier_name: bill.supplier_name || bill.distributor_name || (index ? "校园鲜配" : "达州放心配送"),
  total_amount: bill.total_amount || bill.receivable_amount || 98600 + index * 12400,
  receivable_amount: bill.receivable_amount || bill.total_amount || 98600 + index * 12400,
  settle_amount: bill.settle_amount || bill.actual_settle_amount || (index ? 50000 : bill.receivable_amount || 98600),
  actual_settle_amount: bill.actual_settle_amount || bill.settle_amount || (index ? 50000 : bill.receivable_amount || 98600),
  unsettled_amount: bill.unsettled_amount ?? (index ? 61000 : 0),
  status: ["confirmed", "partially_confirmed"][index % 2],
});

const makeReceivableOrders = (bill: Obj = {}, offset = 0) =>
  makeOrderRows().map((order, index) => {
    const items = (order.list || []).map((item: Obj, itemIndex: number) => ({
      line_id: Number(`${offset + index + 1}${itemIndex + 1}`),
      product_name: item.product_name || item.ingredient_name,
      spec_name: item.specification || "散称",
      quantity: item.received_count || item.count || 1,
      unit: item.unit || "kg",
      quote_price: Number(item.price || 0) / 100,
      national_price: Number(item.price || 0) / 100,
      market_price: Number(item.price || 0) / 100 + 0.2,
      school_price: Number(item.price || 0) / 100 - 0.1,
      settle_price: Number(item.settle_price || item.price || 0) / 100,
      discount_ratio: index === 0 ? 2 : 0,
    }));
    const totalAmount = items.reduce((sum: number, item: Obj) => sum + Number(item.quantity || 0) * Number(item.quote_price || 0), 0);
    return {
      id: `${bill.id || "bill"}-order-${index + 1}`,
      order_no: order.order_no,
      created_at: order.order_time || order.created_at,
      signed_at: index ? "2026-06-22 11:10:00" : `${today} 11:20:00`,
      stocked_at: index ? "2026-06-22 11:30:00" : `${today} 11:40:00`,
      receiver_name: index ? "王库管" : "李安全",
      customer_name: bill.customer_name || bill.school_name || firstCanteenName,
      distributor_name: bill.distributor_name || bill.supplier_name || order.supplier_name,
      total_amount: totalAmount,
      bill_amount: totalAmount,
      settle_amount: totalAmount,
      status: index ? "signed" : "completed",
      items,
    };
  });

const makeInventoryLedgerRows = (): Obj[] => {
  const ingredients = makeIngredientRows();
  const operatorList = [
    { user_name: "王库管", user_phone: "13800000002" },
    { user_name: "李安全", user_phone: "13800000001" },
    { user_name: "张厨师", user_phone: "13800000003" },
  ];
  return ingredients.flatMap((ingredient, index) => {
    const operator = operatorList[index % operatorList.length];
    const org = displayOrgForIndex(index);
    const base = {
      ...ingredient,
      ...operator,
      org_id: org.org_id,
      org_name: org.org_name,
      canteen_name: org.org_name,
      unit_name: org.org_name,
      pro_cover: ingredient.pro_cover || imageData,
      specification: ingredient.specification || "散称",
      guide_price: ingredient.guide_price || ingredient.price || 420,
      measure_type: ingredient.measure_type || 2,
    };
    return [
      common("inventoryLedger", index * 2, {
        ...base,
        id: `ledger-in-${index + 1}`,
        batch_no: `RK2026062${index + 1}`,
        action_type: 1,
        action_id: index % 2 === 0 ? 1 : 2,
        count: 24 + index * 5,
        created_at: `${today} ${String(8 + index).padStart(2, "0")}:20:00`,
      }),
      common("inventoryLedger", index * 2 + 1, {
        ...base,
        id: `ledger-out-${index + 1}`,
        batch_no: `RK2026061${index + 1}`,
        out_batch_no: `CK2026062${index + 1}`,
        action_type: 2,
        action_id: [101, 103, 104][index % 3],
        count: 8 + index * 3,
        created_at: `${today} ${String(13 + index).padStart(2, "0")}:10:00`,
      }),
    ];
  });
};

const makeInventoryCheckRows = (): Obj[] => [
  common("inventoryCheck", 0, { id: "check-1", user_name: "Stock Keeper", user_phone: "13800000002", created_at: `${today} 15:10` }),
  common("inventoryCheck", 1, { id: "check-2", user_name: "Safety Admin", user_phone: "13800000001", created_at: "2026-06-22 16:20" }),
];

const makeTraceabilityItems = (offset = 0): Obj[] =>
  makeIngredientRows().slice(offset, offset + 3).map((ingredient, index) => {
    const quantity = 12 + index * 6 + offset;
    const unitPrice = Number(((Number(ingredient.guide_price || ingredient.price || 420)) / 100).toFixed(2));
    return {
      id: `trace-item-${offset + index + 1}`,
      product_name: ingredient.pro_name || ingredient.product_name || ingredient.name,
      product_id_snapshot: 1000 + offset + index + 1,
      product: 1000 + offset + index + 1,
      spec_name: ingredient.specification || "散称",
      unit: ingredient.unit || "kg",
      unit_price: unitPrice.toFixed(2),
      ordered_quantity: quantity,
      shipped_quantity: quantity,
      received_quantity: quantity,
      subtotal: Number((unitPrice * quantity).toFixed(2)),
      batch_no: `B2026062${offset + index + 1}`,
    };
  });

const makeTraceabilityRecords = (): Obj[] =>
  makeOrderRows().map((order, index) => {
    const org = displayOrgForIndex(index);
    const items = makeTraceabilityItems(index);
    const orderNo = order.order_no || `PS20260623${String(index + 1).padStart(3, "0")}`;
    const placedAt = order.order_time || `${today} 08:30:00`;
    const receivedAt = index === 0 ? `${today} 11:35:00` : "2026-06-22 11:10:00";
    const status = index === 0 ? "completed" : "signed";
    return {
      id: 1001 + index,
      order: `trace-order-${index + 1}`,
      order_item: `trace-order-item-${index + 1}`,
      order_no: orderNo,
      batch_no: `TRACE2026062${index + 1}`,
      placed_at: placedAt,
      created_at: placedAt,
      received_at: receivedAt,
      payment_method: index === 0 ? "月结" : "现结",
      order_status: status,
      buyer_name: org.org_name,
      school_name: org.org_name,
      receiver_name: index === 0 ? "王库管" : "李安全",
      buyer_phone: "028-85110000",
      receiver_phone: index === 0 ? "13800000002" : "13800000001",
      distributor_name: order.supplier_name || order.shop_name || "达州放心配送",
      distributor_phone: index === 0 ? "028-86660001" : "028-86660002",
      distributor_address: index === 0 ? "成都市武侯区供应链配送中心" : "成都市锦江区校园鲜配中心",
      ship_from_address: index === 0 ? "成都市武侯区供应链配送中心" : "成都市锦江区校园鲜配中心",
      ship_to_address: `${org.org_name}后门收货区`,
      remark: "本地演示溯源数据，包含订单、商品、报告和司机履约信息。",
      org_id: org.org_id,
      org_name: org.org_name,
      traceability_items: items,
      nodes: [
        { title: "订单创建", description: "订单状态变更为：已创建", occurred_at: placedAt, operator_name: org.org_name },
        { title: "供应商接单", description: "订单状态变更为：已接单", occurred_at: `${String(placedAt).slice(0, 10)} 09:00:00`, operator_name: order.supplier_name || "配送商" },
        { title: "司机运输", description: "订单状态变更为：运输中", occurred_at: `${String(placedAt).slice(0, 10)} 10:20:00`, operator_name: "赵司机" },
        { title: "学校签收", description: "订单状态变更为：已完成", occurred_at: receivedAt, operator_name: index === 0 ? "王库管" : "李安全" },
      ],
    };
  });

const makeTraceabilityReports = (): Obj[] =>
  makeIngredientRows().slice(0, 4).map((ingredient, index) => ({
    id: `report-${index + 1}`,
    batch_no: ingredient.batch_no || `B2026062${index + 1}`,
    target_type: index % 2 === 0 ? "product" : "supplier",
    target_type_display: index % 2 === 0 ? "商品" : "供应商",
    updated_at: `${today} ${String(9 + index).padStart(2, "0")}:15:00`,
    created_at: `${today} ${String(8 + index).padStart(2, "0")}:45:00`,
    distributor_name: ingredient.supplier_name || "达州放心配送",
    report_type: index % 2 === 0 ? "image" : "document",
    uploaded_by_name: index % 2 === 0 ? "供应商质检员" : "平台审核员",
    related_scope_name: ingredient.pro_name || ingredient.product_name,
    sale_start_at: "2026-06-20 00:00:00",
    sale_end_at: "2026-07-20 23:59:59",
    file_count: 1,
    report_url: imageData,
    files: [{ id: `report-file-${index + 1}`, file_url: imageData }],
  }));

const makeTraceabilityDriverFulfillment = () => ({
  driver_binding: {
    driver_name: "赵司机",
    driver_phone: "13800000009",
    vehicle_plate: "川A12345",
  },
  progress: [
    { code: "driver_assigned", time: `${today} 09:10:00`, done: true },
    { code: "transport_confirmed", time: `${today} 10:00:00`, done: true },
    { code: "delivered_confirmed", time: `${today} 11:35:00`, done: true },
  ],
  images: {
    vehicle: [imageData],
    plate: [imageData],
    driver_selfie: [imageData],
    carriage: [imageData],
    delivery: [imageData],
  },
});

const paginatePlain = (rows: Obj[], query: Obj = {}) => {
  const page = Number(query.page || query.current || 1);
  const size = Number(query.size || query.page_size || query.limit || 20);
  const keyword = String(query.keyword || query.name || query.pro_name || query.order_no || query.batch_no || query.search || "").trim();
  const filtered = rows.filter(row => !keyword || JSON.stringify(row).includes(keyword));
  const start = (page - 1) * size;
  const list = filtered.slice(start, start + size);
  return { list, rows: list, items: list, results: list, total: filtered.length, count: filtered.length, page, size, page_size: size };
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const dateFromMonth = (month: string, day: number) => `${month}-${pad2(day)}`;

const daysInMonth = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
};

const attendanceStaff = (db: LocalDb, query: Obj = {}) => {
  const orgId = String(query.org_id || Storage.get("orgID") || currentOrg().org_id || firstCanteenId);
  const orgIds = getLowestOrgDescendants(orgId).map(item => item.org_id || item.id);
  const fallbackIds = orgIds.length > 0 ? orgIds : [firstCanteenId];
  const attendanceRoleIds = [ROLE.projectManager, ROLE.canteenManager, ROLE.chefLead, ROLE.safety, ROLE.stock, ROLE.firstPost];
  const userRows = db.users
    .map(item => normalizeUser(item))
    .filter(item => !item.hidden)
    .filter(item => item.role_ids?.some((roleId: string) => attendanceRoleIds.includes(roleId)))
    .filter(item => item.org_ids?.some((id: string) => fallbackIds.includes(id) || getDescendantOrgIds(id).some(childId => fallbackIds.includes(childId))) || item.org_ids?.includes(firstCanteenId))
    .map((item, index) => {
      const role = item.roles?.find((row: Obj) => attendanceRoleIds.includes(row.role_id)) || item.roles?.[0] || {};
      const org = getOrg(item.org_ids?.[0] || fallbackIds[index % fallbackIds.length] || firstCanteenId);
      return {
        id: item.id,
        user_id: item.id,
        name: item.nick || item.name || item.account,
        role_id: role.role_id || item.role_id,
        role_name: role.role_name || item.role_name,
        org_id: org.org_id,
        org_name: org.org_name,
      };
    });
  const practitionerRows = db.rows
    .filter(row => row.kind === "staff")
    .filter(row => String(row.status ?? "0") === "0")
    .filter(row => fallbackIds.includes(row.org_id) || row.org_id === firstCanteenId)
    .map(row => ({
      id: row.id,
      user_id: row.id,
      name: row.user_name || row.name || row.staff_name,
      role_id: row.role_id || row.role,
      role_name: row.role_name || row.position,
      org_id: row.org_id || firstCanteenId,
      org_name: row.org_name || firstCanteenName,
      superior_id: row.superior_id || "",
      superior_name: row.superior_name || "",
    }));
  const map = new Map<string, Obj>();
  [...userRows, ...practitionerRows].forEach(item => {
    if (item.id && !map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
};

const getSavedSchedule = (db: LocalDb, orgId: string, date: string) =>
  db.rows.find(row => row.kind === "attendanceSchedule" && row.org_id === orgId && row.date === date);

const defaultWorkerIds = (staff: Obj[], day: number) =>
  staff.filter((_, index) => (index + day) % 4 !== 0).map(item => item.id);

const attendanceDayData = (db: LocalDb, query: Obj = {}) => {
  const date = String(query.date || today);
  const orgId = String(query.org_id || Storage.get("orgID") || currentOrg().org_id || firstCanteenId);
  const staff = attendanceStaff(db, { org_id: orgId });
  const day = Number(date.slice(-2)) || 1;
  const saved = getSavedSchedule(db, orgId, date);
  const workerIds = Array.isArray(saved?.worker_ids) ? saved.worker_ids : defaultWorkerIds(staff, day);
  const workers = staff
    .filter(item => workerIds.includes(item.id))
    .map((item, index) => ({
      ...item,
      status: (day + index) % 6 === 0 ? "缺勤" : "到岗",
      check_in_time: (day + index) % 6 === 0 ? "" : `${date} 08:${pad2((index * 7 + day) % 30)}:00`,
      check_out_time: (day + index) % 6 === 0 ? "" : `${date} 17:${pad2((index * 5 + 12) % 30)}:00`,
      location: item.org_name || firstCanteenName,
    }));
  const resters = staff
    .filter(item => !workerIds.includes(item.id))
    .map((item, index) => ({
      ...item,
      status: (day + index) % 5 === 0 ? "请假" : "休息",
    }));
  return { date, staff, workers, resters };
};

const attendanceMonthRows = (db: LocalDb, query: Obj = {}) => {
  const month = String(query.month || today.slice(0, 7));
  return Array.from({ length: daysInMonth(month) }, (_, index) => {
    const date = dateFromMonth(month, index + 1);
    const day = attendanceDayData(db, { ...query, date });
    return {
      id: `attendance-${date}`,
      date,
      work_count: day.workers.length,
      rest_count: day.resters.length,
    };
  });
};

const makeAttendanceRecords = (db: LocalDb, query: Obj = {}) => {
  const month = String(query.start_time || today).slice(0, 7);
  const dates = [22, 23, 24, 25, 26].map(day => dateFromMonth(month, day));
  const rows = dates.flatMap(date => {
    const day = attendanceDayData(db, { ...query, date });
    return [
      ...day.workers.map((item: Obj) => ({
        id: `attendance-record-${date}-${item.id}`,
        org_id: item.org_id,
        org_name: item.org_name,
        name: item.name,
        check_in_time: item.check_in_time || "-",
        check_out_time: item.check_out_time || "-",
        location: item.location || item.org_name,
        status: item.status,
        attendance_date: date,
      })),
      ...day.resters.map((item: Obj) => ({
        id: `attendance-record-${date}-${item.id}`,
        org_id: item.org_id,
        org_name: item.org_name,
        name: item.name,
        check_in_time: "-",
        check_out_time: "-",
        location: item.org_name,
        status: item.status,
        attendance_date: date,
      })),
    ];
  });
  return rows
    .filter(row => !query.name || String(row.name || "").includes(String(query.name)))
    .filter(row => !query.start_time || row.attendance_date >= query.start_time)
    .filter(row => !query.end_time || row.attendance_date <= query.end_time);
};

const attendanceSummary = (rows: Obj[]) => {
  const expected = rows.filter(row => row.status !== "休息").length;
  const actual = rows.filter(row => row.status === "到岗").length;
  const leave = rows.filter(row => row.status === "请假").length;
  const absent = rows.filter(row => row.status === "缺勤").length;
  const rest = rows.filter(row => row.status === "休息").length;
  return {
    expected_count: expected,
    actual_count: actual,
    leave_count: leave,
    absent_count: absent,
    rest_count: rest,
    attendance_rate: expected > 0 ? Math.round((actual / expected) * 100) : 0,
  };
};

const seedLeaveRows = (db: LocalDb, query: Obj = {}) => {
  const staff = attendanceStaff(db, query);
  const fallback = staff.length > 0 ? staff : attendanceStaff(db, { org_id: firstCanteenId });
  const approver = fallback.find(item => item.role_id === ROLE.canteenManager) || fallback.find(item => item.role_id === ROLE.chefLead) || fallback[0] || {};
  const ccUser = normalizeUser(db.users.find(item => item.id === "u-project-manager") || {});
  const statuses = ["审批中", "审批通过", "审批不通过"];
  return fallback.slice(0, 5).map((item, index) => ({
    id: `leave-${index + 1}`,
    applicant_id: item.id,
    applicant_name: item.name,
    name: item.name,
    org_id: item.org_id,
    org_name: item.org_name,
    leave_start_time: `${dateList[index % dateList.length]} 08:00:00`,
    leave_end_time: `${dateList[index % dateList.length]} 17:30:00`,
    reason: ["身体不适", "家中有事", "参加培训", "调休", "临时外出"][index % 5],
    submit_time: `${dateList[index % dateList.length]} 07:${pad2(30 + index)}:00`,
    status: String(index % 3),
    status_text: statuses[index % statuses.length],
    handover_user_id: fallback[(index + 1) % fallback.length]?.id || "",
    handover_name: fallback[(index + 1) % fallback.length]?.name || "",
    handover_temp_role_id: item.role_id || "",
    handover_temp_role_name: item.role_name || "",
    approver_id: approver.id || "u-canteen-manager",
    approver_name: approver.name || "测试食堂管理员",
    approve_time: index % 3 === 0 ? "" : `${dateList[index % dateList.length]} 09:20:00`,
    cc_id: ccUser.id || "u-project-manager",
    cc_name: ccUser.nick || ccUser.name || "测试项目经理",
    cc_time: index % 3 === 1 ? `${dateList[index % dateList.length]} 09:35:00` : "",
  }));
};

const getLeaveRows = (db: LocalDb, query: Obj = {}) => {
  const saved = db.rows.filter(row => row.kind === "attendanceLeave");
  return [...saved, ...seedLeaveRows(db, query)]
    .filter(row => !query.name || String(row.applicant_name || row.name || "").includes(String(query.name)))
    .filter(row => !query.start_time || String(row.leave_end_time || "") >= String(query.start_time))
    .filter(row => !query.end_time || String(row.leave_start_time || "") <= `${query.end_time} 23:59:59`);
};

const handoverUserRows = (db: LocalDb) =>
  attendanceStaff(db).filter(item => [ROLE.projectManager, ROLE.canteenManager, ROLE.chefLead, ROLE.safety, ROLE.stock].includes(item.role_id));

const approvalUsers = (db: LocalDb) => {
  const staff = attendanceStaff(db);
  const approver = staff.find(item => item.role_id === ROLE.canteenManager) || staff.find(item => item.role_id === ROLE.chefLead) || staff[0] || {};
  const projectManager = normalizeUser(db.users.find(item => item.id === "u-project-manager") || {});
  return {
    approver: {
      id: approver.id || "u-canteen-manager",
      name: approver.name || "测试食堂管理员",
      role_name: approver.role_name || "食堂经理",
    },
    cc_user: {
      id: projectManager.id || "u-project-manager",
      name: projectManager.nick || projectManager.name || "测试项目经理",
      role_name: projectManager.role_name || "项目经理",
    },
  };
};

const makeFoodAdditiveRows = (): Obj[] =>
  [
    ["番茄炒蛋", "120", "山梨酸钾", "8", "李安全"],
    ["青菜豆腐汤", "80", "D-异抗坏血酸钠", "5", "张厨师"],
  ].map(([producetName, totalQuantity, additiveName, useage, recorder], index) =>
    common("foodAdditive", index, {
      producet_name: producetName,
      dish_name: producetName,
      total_quantity: totalQuantity,
      additive_category: index === 0 ? "防腐剂" : "抗氧化剂",
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
    ["李安全", "1", "1,2,3", 260, "92", 45, "1,4"],
    ["张厨师", "2", "4,5,6", 180, "88", 30, "2,4"],
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
    ["2026-06-23", "1", "李安全", "1,2,3"],
    ["2026-06-18", "4", "王库管", "2,4"],
  ].map(([date, area, operator, content], index) =>
    common("fourPest", index, {
      disinfection_date: date,
      disinfection_area: area,
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
      { dish_id: "dish-1", dish_name: "番茄炒蛋", meal_types: "0", price: 8 },
      { dish_id: "dish-2", dish_name: "土豆烧牛肉", meal_types: "2", price: 9.2 },
      { dish_id: "dish-3", dish_name: "青菜豆腐汤", meal_types: "4", price: 10.4 },
    ],
  }));

const templateItems = (type: "daily" | "monthly") => [
  { item: type === "daily" ? "环境卫生" : "食品安全制度", content: "地面、台面、工具清洁完好", status: "1", not_ok_desc: "", sort: 1 },
  { item: type === "daily" ? "人员晨检" : "台账记录", content: "从业人员体温、健康状态正常", status: "1", not_ok_desc: "", sort: 2 },
  { item: type === "daily" ? "留样管理" : "设施设备", content: "留样重量、时间、标签符合要求", status: "0", not_ok_desc: "", sort: 3 },
];

const overview: Obj = {
  canteen_count: 3,
  canteen_info: { name: firstCanteenName, org_name: firstCanteenName, address: `${firstCanteenName}地址`, meal_type: "早餐,午餐,晚餐" },
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

const flattenTree = (tree: Obj[]): Obj[] =>
  tree.flatMap(item => [item, ...flattenTree(Array.isArray(item.children) ? item.children : [])]);

const allOrgs = () => flattenTree(orgTree);
const getOrg = (orgId = "") => allOrgs().find(item => item.org_id === orgId || item.id === orgId) || allOrgs()[0] || {};
const getRole = (roleId = "") => roles.find(item => item.role_id === roleId || item.id === roleId) || roles[0];
const toOrgSummary = (org: Obj = {}) => ({
  id: org.id || org.org_id,
  org_id: org.org_id || org.id,
  name: org.name || org.org_name,
  org_name: org.org_name || org.name,
  org_type: org.org_type,
  unit_attr: org.unit_attr,
  parent_id: org.parent_id,
  pid: org.pid,
});

const getDescendantOrgIds = (orgId = ""): string[] => {
  const org = getOrg(orgId);
  const ids = [org.id || org.org_id].filter(Boolean);
  const children = Array.isArray(org.children) ? org.children : [];
  return [...ids, ...children.flatMap((item: Obj) => getDescendantOrgIds(item.id || item.org_id))];
};

const getLowestOrgDescendants = (orgId = ""): Obj[] => {
  const root = getOrg(orgId);
  const leaves = flattenTree(root?.org_id ? [root] : orgTree).filter(item => item.org_type === "canteen");
  return leaves.length > 0 ? leaves : [root].filter(item => item?.org_id);
};

const dataOrgRoot = () => {
  const storedOrgId = String(Storage.get("orgID") || "");
  return storedOrgId ? toOrgSummary(getOrg(storedOrgId)) : currentOrg();
};

const displayOrgForIndex = (index = 0) => {
  const root = dataOrgRoot();
  const lowestOrgs = getLowestOrgDescendants(root.org_id);
  const org = lowestOrgs[index % Math.max(lowestOrgs.length, 1)] || root;
  return toOrgSummary(org);
};

const getProjectCanteenIds = (projectId = "") =>
  (findOrgNode(orgTree, projectId)?.children || [])
    .filter((item: Obj) => item.org_type === "canteen")
    .map((item: Obj) => item.org_id || item.id)
    .filter(Boolean);

const switchableOrgsForRole = (user: Obj, roleId = "") => {
  const role = getRole(roleId || user.role_id);
  if (role.role_id === ROLE.platformAdmin) {
    return [toOrgSummary(getOrg("org-company-zlzh"))];
  }
  if (role.role_id === ROLE.projectManager) {
    return resolveUserOrgs(user.org_ids || []).filter(item => item.org_type === "project");
  }
  return resolveUserOrgs(user.org_ids || []).filter(item => item.org_type === "canteen").slice(0, 1);
};

const resolveUserOrgs = (orgIds: string[] = []) => {
  const ids = orgIds.length > 0 ? orgIds : [allOrgs().find(item => item.org_type === "canteen")?.id || allOrgs()[0]?.id].filter(Boolean);
  return ids.map(id => toOrgSummary(getOrg(id))).filter(item => item.org_id);
};

const getUserRoles = (roleIds: string[] = []) =>
  roleIds
    .map(id => {
      const role = getRole(id);
      return {
        id: role.id,
        role_id: role.role_id,
        code: role.code,
        role_code: role.role_code,
        name: role.name,
        role_name: role.role_name,
        rule: role.rule,
      };
    })
    .filter(item => item.role_id);

const mergeRules = (userRoles: Obj[] = []) => {
  if (userRoles.some(item => item.rule === fullRule)) return fullRule;
  return Array.from(new Set(userRoles.flatMap(item => String(item.rule || "").split(",").filter(Boolean)))).join(",");
};

const normalizeUser = (user: Obj = {}) => {
  const roleIds = Array.isArray(user.role_ids)
    ? user.role_ids.filter(Boolean)
    : String(user.role_id || ROLE.firstPost).split(",").filter(Boolean);
  const orgIds = Array.isArray(user.org_ids)
    ? user.org_ids.filter(Boolean)
    : Array.isArray(user.orgs)
      ? user.orgs.map((item: Obj) => item.org_id || item.id).filter(Boolean)
      : [user.org_id].filter(Boolean);
  const userRoles = getUserRoles(roleIds);
  const userOrgs = resolveUserOrgs(orgIds);
  const firstOrg = userOrgs[0] || {};
  const firstRole = userRoles[0] || {};
  const roleNames = userRoles.map(item => item.role_name).join("、");
  const primaryRoleId = roleIds[0] || "";
  const switchableOrgs = switchableOrgsForRole({ ...user, org_ids: userOrgs.map(item => item.org_id), role_id: primaryRoleId }, primaryRoleId);
  const activeOrg = switchableOrgs[0] || firstOrg || {};
  return {
    ...user,
    id: user.id || user.admin_id || `u-${Date.now()}`,
    admin_id: user.admin_id || user.id || `u-${Date.now()}`,
    password: user.password || PASSWORD_123456,
    name: user.name || user.nick,
    nick: user.nick || user.name || user.account,
    phone: user.phone || user.mobile || "13800000000",
    mobile: user.mobile || user.phone || "13800000000",
    role_id: primaryRoleId,
    role_ids: roleIds,
    role_code: firstRole.role_code,
    role_codes: userRoles.map(item => item.role_code),
    role_name: roleNames,
    roles: userRoles,
    rule: mergeRules(userRoles),
    org_id: activeOrg.org_id || "",
    org_name: activeOrg.org_name || "",
    org_ids: userOrgs.map(item => item.org_id),
    orgs: switchableOrgs.length > 0 ? switchableOrgs : userOrgs,
    all_orgs: userOrgs,
    user_scope: user.user_scope || (roleIds.includes(ROLE.platformAdmin) ? "platform" : "canteen"),
    role_group: "canteen",
  };
};

const makeUser = (id: string, account: string, nick: string, roleIds: string[], orgIds: string[], extra: Obj = {}) =>
  normalizeUser({
    id,
    admin_id: id,
    account,
    nick,
    name: nick,
    phone: extra.phone || "13800000000",
    password: PASSWORD_ADMIN,
    role_ids: roleIds,
    org_ids: orgIds,
    ...extra,
  });

const seedUsers = () => [
  makeUser("u-platform-admin", "admin", "平台管理员", [ROLE.platformAdmin], allOrgs().map(item => item.id), { hidden: true, user_scope: "platform", password: PASSWORD_ADMIN }),
  makeUser("u-project-manager", "xmjl", "测试项目经理", [ROLE.projectManager], [firstProjectId, "org-project-jinjiang"], { password: PASSWORD_ADMIN }),
  makeUser("u-canteen-manager", "stgly", "测试食堂管理员", [ROLE.canteenManager], [firstCanteenId], { password: PASSWORD_ADMIN }),
  makeUser("u-chef-lead", "csz", "测试厨师长", [ROLE.chefLead, ROLE.safety], [firstCanteenId], { password: PASSWORD_ADMIN }),
  makeUser("u-safety", "aqy", "测试安全员", [ROLE.safety, ROLE.stock], [firstCanteenId], { password: PASSWORD_ADMIN }),
  makeUser("u-stock", "kg", "测试库管", [ROLE.stock, ROLE.firstPost], [firstCanteenId], { password: PASSWORD_ADMIN }),
  makeUser("u-first-post", "yjgw", "测试一级岗位", [ROLE.firstPost, ROLE.chefLead], [firstCanteenId], { password: PASSWORD_ADMIN }),
];

const initialDb = (): LocalDb => ({
  rows: makeRows(),
  users: seedUsers(),
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

const byKind = (db: LocalDb, kinds: string | string[]) => {
  const list = Array.isArray(kinds) ? kinds : [kinds];
  return db.rows.filter(row => list.includes(row.kind));
};

const pickRows = (url: string, db: LocalDb) => {
  if (url.includes("admin/list")) return filterUsersForCreator(db.users);
  if (url.includes("role")) return db.roles.filter(item => !item.hidden);
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
  if (url.includes("page-alarm")) return byKind(db, "supervision");
  if (url.includes("warn") || url.includes("alarm") || url.includes("price")) return byKind(db, "warning");
  if (url.includes("page-ingredient") || url.includes("inventory") || url.includes("batch") || url.includes("category")) return byKind(db, "ingredient");
  if (url.includes("page-dish") || url.includes("get-dish")) return byKind(db, "dish");
  if (url.includes("catering-objects")) return byKind(db, "catering");
  if (url.includes("page-recipe") || url.includes("list-recipe") || url.includes("get-recipe")) return byKind(db, "recipe");
  if (url.includes("practitioners")) return byKind(db, "staff");
  if (url.includes("recipe-volume") || url.includes("procurementcosts")) return byKind(db, "procurement");
  if (url.includes("questionnaire") || url.includes("student-parent") || url.includes("activity")) return byKind(db, ["catering", "staff", "procurement"]);
  if (url.includes("food-additive-useage")) return byKind(db, "foodAdditive");
  if (url.includes("tableware-disinfection") || url.includes("disinfect-dises")) return byKind(db, "tableware");
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

const currentUser = () => normalizeUser(Storage.get("SystemUserinfo") || seedUsers()[0]);
const currentRoleId = () => Storage.get("roleID") || currentUser().role_id;
const currentOrg = () => {
  const user = currentUser();
  const activeRoleId = currentRoleId();
  const orgs = switchableOrgsForRole(user, activeRoleId);
  const storedOrgId = String(Storage.get("orgID") || "");
  return orgs.find(item => item.org_id === storedOrgId) || orgs[0] || toOrgSummary(getOrg(user.org_id));
};
const hasRole = (user: Obj, roleId: string) => {
  const ids = Array.isArray(user.role_ids) ? user.role_ids : String(user.role_id || "").split(",");
  return ids.includes(roleId);
};

const allowedRoleIdsForCreator = (user = currentUser()) => {
  if (hasRole(user, ROLE.platformAdmin)) return [ROLE.projectManager];
  if (hasRole(user, ROLE.projectManager)) return [ROLE.canteenManager];
  if (hasRole(user, ROLE.canteenManager)) return [ROLE.chefLead, ROLE.safety, ROLE.stock, ROLE.firstPost];
  return [];
};

const visibleRolesForCreator = (user = currentUser()) => {
  const allowed = allowedRoleIdsForCreator(user);
  return roles.filter(item => allowed.includes(item.role_id));
};

const filterUsersForCreator = (users: Obj[], query: Obj = {}) => {
  const user = currentUser();
  const currentOrgId = String(Storage.get("orgID") || user.org_id || "");
  const visibleOrgIds = hasRole(user, ROLE.platformAdmin)
    ? allOrgs().map(item => item.id)
    : Array.from(new Set(((user.all_orgs || user.orgs || []).map((item: Obj) => item.org_id || item.id).filter(Boolean)).flatMap((id: string) => getDescendantOrgIds(id))));
  return users
    .map(item => normalizeUser(item))
    .filter(item => !item.hidden)
    .filter(item => !query.role_id || item.role_ids.includes(query.role_id))
    .filter(item => !query.nick || String(item.nick || "").includes(String(query.nick)))
    .filter(item => !query.phone || String(item.phone || "").includes(String(query.phone)))
    .filter(item => {
      const orgIds = item.org_ids || [];
      if (query.org_id) return orgIds.includes(query.org_id);
      if (hasRole(user, ROLE.platformAdmin)) return true;
      if (currentOrgId && getDescendantOrgIds(currentOrgId).some(id => orgIds.includes(id))) return true;
      return orgIds.some((id: string) => visibleOrgIds.includes(id));
    });
};

const prepareUserPayload = (data: Obj = {}, existing: Obj = {}) => {
  const user = currentUser();
  const allowed = allowedRoleIdsForCreator(user);
  const requestedRoleIds = Array.isArray(data.role_ids)
    ? data.role_ids
    : String(data.role_id || "").split(",").filter(Boolean);
  const roleIds = requestedRoleIds.filter((id: string) => allowed.includes(id));
  const fallbackRoleIds = roleIds.length > 0 ? roleIds : allowed.slice(0, 1);
  const requestedOrgIds = Array.isArray(data.org_ids)
    ? data.org_ids
    : Array.isArray(data.org_id)
      ? data.org_id
      : String(data.org_id || "").split(",").filter(Boolean);
  const roleId = currentRoleId();
  const current = currentOrg();
  const projectCanteenIds = roleId === ROLE.projectManager ? getProjectCanteenIds(current.org_id) : [];
  const orgIds = hasRole(user, ROLE.platformAdmin)
    ? requestedOrgIds
    : roleId === ROLE.projectManager
      ? [projectCanteenIds[0] || requestedOrgIds[0] || ""].filter(Boolean)
      : [String(current.org_id || user.org_id || requestedOrgIds[0] || "")].filter(Boolean);
  return normalizeUser({
    ...existing,
    ...data,
    id: existing.id || data.id || data.admin_id || `u-${Date.now()}`,
    admin_id: existing.admin_id || data.admin_id || data.id || `u-${Date.now()}`,
    password: data.password || existing.password || PASSWORD_123456,
    role_ids: fallbackRoleIds,
    org_ids: orgIds,
    hidden: false,
  });
};

const authenticate = (data: Obj, db: LocalDb) => {
  const account = String(data.account || data.username || "").trim();
  const password = String(data.password || "").trim();
  const user = db.users.map(item => normalizeUser(item)).find(item => item.account === account);
  if (!user) return null;
  if (password && password !== user.password) return null;
  const normalized = normalizeUser(user);
  const activeRole = normalized.roles[0] || {};
  const orgs = switchableOrgsForRole(normalized, activeRole.role_id || normalized.role_id);
  const activeOrg = orgs[0] || toOrgSummary(getOrg(normalized.org_id));
  return {
    ...normalized,
    org_id: activeOrg.org_id,
    org_name: activeOrg.org_name,
    orgs,
    token: `local-token-${normalized.id}`,
    role_id: activeRole.role_id || normalized.role_id,
    role_code: activeRole.role_code || normalized.role_code,
    role_name: activeRole.role_name || normalized.role_name,
    rule: activeRole.rule || normalized.rule,
  };
};

const findOrgNode = (tree: Obj[], id = ""): Obj | undefined => {
  for (const item of tree) {
    if (item.id === id || item.org_id === id) return item;
    const child = findOrgNode(Array.isArray(item.children) ? item.children : [], id);
    if (child) return child;
  }
};

const visibleOrgTreeForCurrentUser = () => {
  const user = currentUser();
  const roleId = currentRoleId();
  if (roleId === ROLE.platformAdmin) return clone(orgTree);
  const ids = (user.all_orgs || user.orgs || []).map((item: Obj) => item.org_id || item.id).filter(Boolean);
  if (roleId === ROLE.projectManager) {
    return ids
      .map((id: string) => clone(findOrgNode(orgTree, id)))
      .filter((item: Obj) => item && item.org_type === "project");
  }
  return ids
    .map((id: string) => clone(findOrgNode(orgTree, id)))
    .filter((item: Obj) => item && item.org_type === "canteen");
};

const upsertOrg = (db: LocalDb, data: Obj = {}) => {
  const id = data.id || data.org_id || `org-${Date.now()}`;
  const parentId = data.parent_id || data.pid || "";
  const existing = findOrgNode(db.orgTree, id);
  const normalized = {
    ...makeOrg(id, data.name || data.org_name || "新增组织", data.unit_attr === "8" ? "canteen" : data.unit_attr === "4" ? "project" : "company", parentId),
    ...existing,
    ...data,
    id,
    org_id: id,
    value: id,
    pid: parentId,
    parent_id: parentId,
    org_name: data.org_name || data.name || existing?.org_name,
    label: data.name || data.org_name || existing?.name,
  };
  if (existing) {
    Object.assign(existing, normalized, { children: existing.children || normalized.children || [] });
  } else if (parentId) {
    const parent = findOrgNode(db.orgTree, parentId);
    if (parent) {
      parent.children = Array.isArray(parent.children) ? parent.children : [];
      parent.children.push(normalized);
    } else {
      db.orgTree.push(normalized);
    }
  } else {
    db.orgTree.push(normalized);
  }
  saveDb(db);
  return normalized;
};

const removeOrg = (tree: Obj[], ids: string[]): Obj[] =>
  tree
    .filter(item => !ids.includes(item.id) && !ids.includes(item.org_id))
    .map(item => ({ ...item, children: removeOrg(Array.isArray(item.children) ? item.children : [], ids) }));

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
    org_name: row.org_name || firstCanteenName,
    canteen_name: row.canteen_name || firstCanteenName,
    unit_name: row.unit_name || firstCanteenName,
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
  const activeOrg = displayOrgForIndex(index);
  if (activeOrg?.org_id && item.kind !== "user") {
    item.org_id = activeOrg.org_id;
    item.org_name = activeOrg.org_name;
    item.canteen_name = activeOrg.org_name;
    item.unit_name = activeOrg.org_name;
    item.schoolName = activeOrg.org_name;
    item.orgName = activeOrg.org_name;
  }
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

const paginateUsers = (db: LocalDb, query: Obj = {}) => {
  const rows = filterUsersForCreator(db.users, query);
  const page = Number(query.page || query.current || 1);
  const size = Number(query.size || query.page_size || query.limit || 20);
  const start = (page - 1) * size;
  const list = rows.slice(start, start + size);
  return { list, rows: list, items: list, total: rows.length, count: rows.length, page, size };
};

const upsertRow = (db: LocalDb, data: Obj = {}, url = "") => {
  if (url.includes("org/merge")) return upsertOrg(db, data);
  if (url.includes("admin/create") || url.includes("admin/edit")) {
    const id = findId(data);
    const index = db.users.findIndex(item => findId(item) === id || item.id === id);
    const row = prepareUserPayload(data, index >= 0 ? db.users[index] : {});
    if (index >= 0) db.users[index] = row;
    else db.users.unshift(row);
    saveDb(db);
    return row;
  }
  const kind = getKindFromUrl(url);
  const id = findId(data) || `${kind}-${Date.now()}`;
  const normalizedData = { ...data };
  if (url.includes("food-additive-useage")) {
    normalizedData.dish_name = normalizedData.dish_name || normalizedData.producet_name;
    normalizedData.producet_name = normalizedData.producet_name || normalizedData.dish_name;
    normalizedData.recorder = normalizedData.recorder || normalizedData.operator || "李安全";
  }
  if (url.includes("practitioners")) {
    normalizedData.name = normalizedData.name || normalizedData.user_name;
    normalizedData.staff_name = normalizedData.staff_name || normalizedData.user_name;
    normalizedData.nick = normalizedData.nick || normalizedData.user_name;
    normalizedData.role_id = normalizedData.role_id || normalizedData.role;
    normalizedData.superior_name = normalizedData.superior_name || normalizedData.leader_name || "";
  }
  if (url.includes("four-pest-disinfection")) {
    normalizedData.disinfection_area = normalizedData.disinfection_area || normalizedData.region || "1";
    normalizedData.operator = normalizedData.operator || normalizedData.user_name || "李安全";
  }
  const row = normalizeRow({ kind, id, [`${kind}_id`]: id, ...normalizedData }, 0);
  const targetList = url.includes("admin/") ? db.users : url.includes("role") ? db.roles : db.rows;
  const index = targetList.findIndex((item: Obj) => findId(item) === id || item.id === id);
  if (index >= 0) targetList[index] = { ...targetList[index], ...row };
  else targetList.unshift(row);
  saveDb(db);
  return row;
};

const removeRow = (db: LocalDb, data: Obj = {}) => {
  const ids = [findId(data), ...(Array.isArray(data.ids) ? data.ids : [])].filter(Boolean);
  if (ids.length > 0) {
    db.orgTree = removeOrg(db.orgTree, ids);
  }
  db.rows = db.rows.filter(row => !ids.includes(findId(row)) && !ids.includes(row.id));
  db.users = db.users.filter(row => row.hidden || (!ids.includes(findId(row)) && !ids.includes(row.id)));
  db.roles = db.roles.filter(row => !ids.includes(findId(row)) && !ids.includes(row.id));
  saveDb(db);
};

const getKindFromUrl = (url: string) => {
  if (url.includes("dish")) return "dish";
  if (url.includes("food-additive-useage")) return "foodAdditive";
  if (url.includes("tableware-disinfection") || url.includes("disinfect-dises")) return "tableware";
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

const makeIngredientSuggestionItem = (ingredient: Obj, dayIndex: number, dishIndex: number, ingredientIndex: number, prepareCount: number) => {
  const usageCount = Number(ingredient.usage_count || ingredient.quantity || 50);
  const needCount = Number(((prepareCount * usageCount) / 1000).toFixed(2));
  const stockCount = Math.max(Number(ingredient.count || 0) - dayIndex * 2 - ingredientIndex * 3, 0);
  return {
    id: `weekly-ingredient-${dayIndex + 1}-${dishIndex + 1}-${ingredientIndex + 1}`,
    pro_name: ingredient.pro_name || ingredient.ingredient_name || ingredient.name,
    product_name: ingredient.product_name || ingredient.pro_name || ingredient.name,
    pro_no: ingredient.pro_no || `SC-WEEK-${String(dayIndex + 1).padStart(2, "0")}${String(dishIndex + 1).padStart(2, "0")}${ingredientIndex + 1}`,
    specification: ingredient.specification || "散称",
    unit: ingredient.unit || "kg",
    measure_type: ingredient.measure_type || 2,
    count: stockCount,
    usage_count: usageCount,
    usage_text: `${usageCount}g/份`,
    need_count: needCount,
    order_count: Math.max(Number((needCount - stockCount).toFixed(2)), 0),
    supplier_id: ingredient.supplier_id || `procurement-${(ingredientIndex % 3) + 1}`,
    supplier_name: ingredient.supplier_name || ["达州放心配送", "校园鲜配", "安心肉联"][ingredientIndex % 3],
  };
};

const makeWeeklyDishSuggestion = (name = "") =>
  dateList
    .map((date, dayIndex) => {
      const dishes = makeDishRows().slice(0, 3).map((dish, dishIndex) => {
        const prepareCount = 120 + dayIndex * 15 + dishIndex * 30;
        const ingredients = (Array.isArray(dish.ingedients) ? dish.ingedients : []).map((ingredient: Obj, ingredientIndex: number) =>
          makeIngredientSuggestionItem(ingredient, dayIndex, dishIndex, ingredientIndex, prepareCount)
        );
        return {
          id: `weekly-dish-${dayIndex + 1}-${dishIndex + 1}`,
          dish_id: dish.id,
          dish_name: dish.dish_name || dish.name,
          name: dish.dish_name || dish.name,
          prepare_count: prepareCount,
          ingredient_usage: ingredients.map((item: Obj) => `${item.pro_name}${item.usage_text}`).join("、"),
          ingredients,
        };
      });
      return {
        id: `weekly-day-${dayIndex + 1}`,
        date,
        meal_date: date,
        week: weekNameList[dayIndex],
        day_index: dayIndex,
        is_next_day: dayIndex === 1,
        dishes,
      };
    })
    .filter(item => !name || JSON.stringify(item).includes(name));

const makeWeeklyIngredientSuggestion = (name = "") =>
  makeWeeklyDishSuggestion(name)
    .flatMap(day =>
      day.dishes.flatMap((dish: Obj) =>
        dish.ingredients.map((ingredient: Obj) => ({
          ...ingredient,
          date: day.date,
          meal_date: day.date,
          week: day.week,
          day_index: day.day_index,
          is_next_day: day.is_next_day,
          dish_id: dish.dish_id,
          dish_name: dish.dish_name,
          prepare_count: dish.prepare_count,
        }))
      )
    )
    .filter(item => !name || JSON.stringify(item).includes(name));

const weeklyIngredientNames = [
  ["番茄", "鸡蛋", "大米"],
  ["土豆", "牛肉", "青菜"],
  ["豆腐", "小葱", "鸡胸肉"],
  ["胡萝卜", "黄瓜", "猪肉"],
  ["白菜", "面粉", "牛奶"],
  ["南瓜", "排骨", "冬瓜"],
  ["西兰花", "虾仁", "紫菜"],
];

const makeWeeklyIngredientSuggestionLegacy = (name = "") =>
  dateList
    .flatMap((date, dayIndex) =>
      weeklyIngredientNames[dayIndex].map((proName, index) => {
        const needCount = 24 + dayIndex * 4 + index * 6;
        const stockCount = 8 + index * 5;
        return {
          id: `weekly-ingredient-${dayIndex + 1}-${index + 1}`,
          date,
          meal_date: date,
          week: weekNameList[dayIndex],
          day_index: dayIndex,
          is_next_day: dayIndex === 1,
          pro_name: proName,
          product_name: proName,
          pro_no: `SC-WEEK-${String(dayIndex + 1).padStart(2, "0")}${String(index + 1).padStart(2, "0")}`,
          specification: index === 1 ? "500g/份" : "散称",
          unit: "kg",
          measure_type: 2,
          count: stockCount,
          need_count: needCount,
          order_count: Math.max(needCount - stockCount, 0),
          supplier_id: `procurement-${(index % 3) + 1}`,
          supplier_name: ["达州放心配送", "校园鲜配", "安心肉联"][index % 3],
        };
      })
    )
    .filter(item => !name || JSON.stringify(item).includes(name));

const special = (url: string, data: Obj, db: LocalDb) => {
  if (url.includes("/image")) return ok({ image: imageData, captcha_id: "captcha-local" }, "验证码获取成功");
  if (url.includes("/login") || url.includes("/sms-login") || url.includes("/tokenlogin")) {
    const user = authenticate(data, db);
    if (!user) return { success: false, code: 401, msg: "账号或密码错误", message: "账号或密码错误", data: {} };
    return ok(user, "登录成功");
  }
  if (url.includes("/sms")) return ok({ code: "123456" }, "短信验证码已发送");
  if (url.includes("/logout")) return ok({}, "退出成功");
  if (url.includes("/auth/userinfo")) {
    const cached = normalizeUser(Storage.get("SystemUserinfo") || seedUsers()[0]);
    const activeRoleId = Storage.get("roleID") || cached.role_id;
    const activeRole = getRole(activeRoleId);
    const activeOrgs = switchableOrgsForRole(cached, activeRoleId);
    const activeOrg = activeOrgs.find(item => item.org_id === Storage.get("orgID")) || activeOrgs[0] || toOrgSummary(getOrg(cached.org_id));
    return ok({
      ...cached,
      org_id: activeOrg.org_id,
      org_name: activeOrg.org_name,
      orgs: activeOrgs,
      role_id: activeRole.role_id,
      role_code: activeRole.role_code,
      role_name: activeRole.role_name,
      rule: activeRole.rule,
    });
  }
  if (url.includes("/config/info")) return ok({ key: data.key, value: data.key === "SystemLogo" ? "" : "食安管理系统" });
  if (url.includes("/role/rules")) return ok({ list: permissionRules });
  if (url.includes("/role/dict")) {
    const list = visibleRolesForCreator();
    return ok({ list, total: list.length });
  }
  if (url.includes("/admin/list")) return ok(paginateUsers(db, data));
  if (url.includes("/admin/get")) {
    const row = db.users.map(item => normalizeUser(item)).find(item => findId(item) === findId(data) || item.id === findId(data)) || {};
    return ok(row);
  }
  if (url.includes("/admin/edit-pwd")) {
    const id = findId(data);
    const target = db.users.find(item => findId(item) === id || item.id === id);
    if (target) {
      target.password = data.password || data.new_password || PASSWORD_123456;
      saveDb(db);
    }
    return ok({});
  }
  if (url.includes("/device/types")) return ok({ list: [{ name: "摄像头", value: "camera" }, { name: "温度计", value: "thermometer" }, { name: "标签打印机", value: "printer" }] });
  if (url.includes("district/tree") || url.includes("div/tree")) return ok({ list: visibleOrgTreeForCurrentUser(), total: visibleOrgTreeForCurrentUser().length });
  if (url.includes("org/tree")) {
    const tree = visibleOrgTreeForCurrentUser();
    const parentId = data.parent_id || "";
    const list = parentId ? (findOrgNode(tree, parentId)?.children || []) : tree;
    return ok({ list: clone(list), total: list.length });
  }
  if (url.includes("org/list") || url.includes("unit/list-catering-units")) {
    const tree = visibleOrgTreeForCurrentUser();
    const list = data.parent_id ? (findOrgNode(tree, data.parent_id)?.children || []) : flattenTree(tree);
    return ok({ list: clone(list), total: list.length });
  }
  if (url.includes("org/page")) {
    const tree = visibleOrgTreeForCurrentUser();
    const rows = data.parent_id ? (findOrgNode(tree, data.parent_id)?.children || []) : tree;
    return ok(paginate(rows, data));
  }
  if (url.includes("attendance/schedule/month")) {
    const list = attendanceMonthRows(db, data);
    return ok({ list, rows: list, total: list.length });
  }
  if (url.includes("attendance/schedule/day")) {
    return ok(attendanceDayData(db, data));
  }
  if (url.includes("attendance/schedule/save")) {
    const orgId = String(data.org_id || Storage.get("orgID") || currentOrg().org_id || firstCanteenId);
    const date = String(data.date || today);
    const existing = getSavedSchedule(db, orgId, date);
    const row = {
      ...(existing || {}),
      kind: "attendanceSchedule",
      id: existing?.id || `attendance-schedule-${orgId}-${date}`,
      org_id: orgId,
      date,
      worker_ids: Array.isArray(data.worker_ids) ? data.worker_ids : [],
      updated_at: `${today} 16:00:00`,
    };
    if (existing) Object.assign(existing, row);
    else db.rows.unshift(row);
    saveDb(db);
    return ok(row, "排班已保存");
  }
  if (url.includes("attendance/records")) {
    const rows = makeAttendanceRecords(db, data);
    const statuses = Array.isArray(data.statuses) ? data.statuses.filter(Boolean) : String(data.status || "").split(",").filter(Boolean);
    const filteredRows = statuses.length > 0 ? rows.filter(row => statuses.includes(row.status)) : rows;
    return ok({ ...paginatePlain(filteredRows, data), summary: attendanceSummary(rows) });
  }
  if (url.includes("attendance/leave/list")) {
    return ok(paginatePlain(getLeaveRows(db, data), data));
  }
  if (url.includes("attendance/leave/submit")) {
    const user = currentUser();
    const org = data.org_id ? getOrg(data.org_id) : currentOrg();
    const approval = approvalUsers(db);
    const row = {
      kind: "attendanceLeave",
      id: `attendance-leave-${Date.now()}`,
      applicant_id: user.id,
      applicant_name: user.nick || user.name || user.account,
      name: user.nick || user.name || user.account,
      org_id: org.org_id || firstCanteenId,
      org_name: org.org_name || firstCanteenName,
      leave_start_time: data.leave_start_time,
      leave_end_time: data.leave_end_time,
      reason: data.reason,
      submit_time: `${today} 10:30:00`,
      status: "0",
      status_text: "审批中",
      handover_user_id: data.handover_user_id || "",
      handover_name: data.handover_name || "",
      handover_temp_role_id: data.handover_temp_role_id || user.role_id || "",
      handover_temp_role_name: data.handover_temp_role_name || user.role_name || "",
      approver_id: approval.approver.id,
      approver_name: approval.approver.name,
      approve_time: "",
      cc_id: approval.cc_user.id,
      cc_name: approval.cc_user.name,
      cc_time: "",
    };
    db.rows.unshift(row);
    saveDb(db);
    return ok(row, "请假申请已提交");
  }
  if (url.includes("attendance/handover-users")) {
    const list = handoverUserRows(db);
    return ok({ list, rows: list, total: list.length });
  }
  if (url.includes("attendance/approval-users")) {
    return ok(approvalUsers(db));
  }
  if (url.includes("inventory/inoutrecord-list")) {
    let rows = makeInventoryLedgerRows();
    const actionType = String(data.action_type || "");
    if (actionType) rows = rows.filter(row => String(row.action_type) === actionType);
    if (data.batch_no) rows = rows.filter(row => String(row.batch_no || "").includes(String(data.batch_no)));
    if (data.out_batch_no) rows = rows.filter(row => String(row.out_batch_no || "").includes(String(data.out_batch_no)));
    if (data.pro_no) rows = rows.filter(row => String(row.pro_no || "").includes(String(data.pro_no)));
    return ok(paginatePlain(rows, data));
  }
  if (url.includes("open/traceability/records/detail")) {
    const rows = makeTraceabilityRecords();
    const orderSn = String(data.order_sn || data.order_no || data.id || "");
    return ok(rows.find(row => row.order_no === orderSn || row.batch_no === orderSn || String(row.id) === orderSn) || rows[0] || {});
  }
  if (url.includes("open/traceability/records/driver-fulfillment")) return ok(makeTraceabilityDriverFulfillment());
  if (url.includes("open/traceability/reports")) return ok(paginatePlain(makeTraceabilityReports(), data));
  if (url.includes("open/traceability/records")) return ok(paginatePlain(makeTraceabilityRecords(), data));
  if (url.includes("page-food-retention")) {
    let rows = makeFoodRetentionRows();
    if (data.status !== undefined && data.status !== "") rows = rows.filter(row => String(row.status) === String(data.status));
    return ok(paginatePlain(rows, data));
  }
  if (url.includes("destroy-food-retention")) {
    const count = data.all_due ? makeFoodRetentionRows().filter(row => row.can_destroy).length : (Array.isArray(data.ids) ? data.ids.length : 1);
    return ok({ count });
  }
  if (url.includes("page-morning-inspection")) return ok(paginatePlain(makeMorningInspectionRows(), data));
  if (url.includes("page-cleaning-record")) return ok(paginatePlain(makeCleaningRecordRows(), data));
  if (url.includes("page-safety-inspection")) return ok(paginatePlain(makeSafetyInspectionRows(), data));
  if (url.includes("page-disinfect-dises")) return ok(paginatePlain(makeTablewareRows(), data));
  if (url.includes("page-four-pest-disinfection")) return ok(paginatePlain(makeFourPestRows(), data));
  if (url.includes("page-food-additive-useage")) return ok(paginatePlain(makeFoodAdditiveRows(), data));
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
  if (url.includes("get-recipe-volume-suggestion-detail") || url.includes("get-recipe-volume-suggestion")) {
    const dayItems = makeWeeklyDishSuggestion(data.name || "");
    return ok({
      suggestion: purchaseSuggestion(data.name || ""),
      day_items: dayItems,
      next_day_items: dayItems.filter(item => item.is_next_day),
      ingredient_items: makeWeeklyIngredientSuggestion(data.name || ""),
    });
  }
  if (url.includes("save-recipe-volume")) return ok({ id: data.id || `volume-${Date.now()}` });
  if (url.includes("reorder-recipe-volume")) return ok({});
  if (url.includes("get-recipe-volume-suggestion-order-info")) return ok({
    list: makeProcurementRows().map(row => ({ supplier_id: row.id, supplier_name: row.supplier_name, status: 1 })),
  });
  if (url.includes("supervision/page-alarm")) {
    let rows = byKind(db, "warning").map((row, index) => normalizeRow(row, index));
    if (data.warn_category) rows = rows.filter(row => row.warn_category === data.warn_category);
    if (data.warning_item) rows = rows.filter(row => row.warning_item === data.warning_item);
    if (data.status) rows = rows.filter(row => row.status === data.status);
    if (data.keyword) rows = rows.filter(row => JSON.stringify(row).includes(data.keyword));
    return ok({ list: rows, rows, results: rows, total: rows.length, count: rows.length });
  }
  if (url.includes("supervision/process-alarm")) {
    const row = db.rows.find(item => item.id === data.id);
    if (row) {
      row.status = "1";
      row.handle_status = "1";
      row.process_desc = data.process_desc || row.process_desc;
      row.process_files = data.process_files || row.process_files;
      row.processor_name = "当前处理人";
      row.processor_time = `${today} 16:30`;
      saveDb(db);
    }
    return ok(row || {});
  }
  if (url.includes("finance/receivable-bills/reconciliation/complete")) return ok({ updated_count: Array.isArray(data.items) ? data.items.length : 0, sfs_sync_failed: false });
  if (url.includes("finance/receivable-bills/reconciliation")) {
    const bill = normalizeFinanceBill(byKind(db, "finance")[0], 0);
    const orders = makeReceivableOrders(bill);
    return ok({ bill, orders: { results: orders, list: orders, count: orders.length, total: orders.length } });
  }
  if (url.includes("finance/receivable-bills/detail")) {
    const rows = byKind(db, "finance").map((row, index) => normalizeFinanceBill(row, index));
    const bill = rows.find(row => findId(row) === findId(data) || row.id === findId(data)) || rows[0] || {};
    const orders = makeReceivableOrders(bill);
    return ok({ ...bill, orders: { results: orders, list: orders, count: orders.length, total: orders.length } });
  }
  if (url.includes("finance/receivable-bills")) {
    const rows = byKind(db, "finance").map((row, index) => normalizeRow(normalizeFinanceBill(row, index), index));
    const filtered = data.status ? rows.filter(row => row.status === data.status) : rows;
    return ok({ results: filtered, list: filtered, count: filtered.length, total: filtered.length });
  }
  if (url.includes("month-price-warninfo")) {
    const list = makeIngredientRows().slice(0, 3).map((row, index) =>
      normalizeRow(
        {
          ...row,
          id: `month-price-detail-${index + 1}`,
          in_time: `${today} ${String(8 + index).padStart(2, "0")}:10`,
          count: 20 + index * 5,
          price: 420 + index * 80,
          unit_weight: 500,
          totalPrice: ((420 + index * 80) / 100) * (20 + index * 5),
        },
        index
      )
    );
    return ok({ list, total: list.length });
  }
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
      const submittedItems = data.items || data.list || [];
      if (submittedItems.length > 0) {
        target.list = (target.list || []).map((item: Obj) => {
          const submitted = submittedItems.find((row: Obj) => row.id === item.id);
          return submitted ? { ...item, ...submitted, sign_status: "signed" } : item;
        });
      }
      const signedCount = (target.list || []).filter((item: Obj) => item.sign_status === "signed").length;
      const totalCount = (target.list || []).length;
      target.receipt_status = signedCount === totalCount ? "done" : signedCount > 0 ? "partial" : "pending";
      target.status = signedCount === totalCount ? 2 : signedCount > 0 ? "部分签收" : "待收货";
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
