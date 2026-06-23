export const pickFirstValue = (row: Obj, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
};

const pickNumber = (row: Obj, keys: string[], defaultValue = 0) => {
  const value = pickFirstValue(row, keys);
  const number = Number(value);
  return Number.isFinite(number) ? number : defaultValue;
};

export const normalizeOrderItem = (item: Obj = {}) => {
  const goodsName = pickFirstValue(item, ["goods_name", "product_name", "ingredient_name", "pro_name", "name"]);
  const catName = pickFirstValue(item, ["cat_name", "category_name", "pro_type_name", "type_name"]);
  const goodsNumber = pickNumber(item, ["goods_number", "count", "goods_count", "number", "quantity"]);
  const sendNumber = pickNumber(item, ["send_number", "send_count", "delivery_count", "goods_number", "count"]);
  const inCount = pickNumber(item, ["in_count", "received_count", "in_house_count", "receive_count"], sendNumber);

  return {
    ...item,
    goods_name: goodsName,
    cat_name: catName,
    goods_number: goodsNumber,
    send_number: sendNumber,
    in_count: inCount,
    out_count: pickNumber(item, ["out_count", "out_house_count"]),
    unit: pickFirstValue(item, ["unit", "unit_name"]),
    goods_image: pickFirstValue(item, ["goods_image", "image", "image_url", "pro_cover"]),
    in_image: pickFirstValue(item, ["in_image", "image_in", "in_house_image"]),
  };
};

export const normalizeOrderDetail = (data: Obj = {}) => {
  const list = Array.isArray(data.list)
    ? data.list
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.order_items)
        ? data.order_items
        : [];

  return {
    ...data,
    shop_name: pickFirstValue(data, ["shop_name", "supplier_name", "provider_name"]),
    shipping_address: pickFirstValue(data, ["shipping_address", "address", "receive_address"]),
    goods_total: pickNumber(data, ["goods_total", "total", "goods_count", "item_count"], list.length),
    order_sn: pickFirstValue(data, ["order_sn", "order_no", "order_number"]),
    list: list.map(normalizeOrderItem),
  };
};
