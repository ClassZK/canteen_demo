/** 入库类型 */
export const InTypeObject: Obj = {
    '1': {
        name: '采购入库',
        value: 1,
    },
    '2': {
        name: '盘点入库',
        value: 2,
    }
};
export const InTypeList: Obj[] = [InTypeObject['1'], InTypeObject['2']];

/** 出库类型 */
export const OutTypeObject: Obj = {
    '101': {
        name: '领用出库',
        value: 101,
    },
    '102': {
        name: '盘点出库',
        value: 102,
    },
    '103': {
        name: '报损出库',
        value: 103,
    },
    '104': {
        name: '退货出库',
        value: 104,
    },
};
export const OutTypeList: Obj[] = [{
    name: '领用出库',
    value: 101,
}, {
    name: '报损出库',
    value: 103,
}, {
    name: '退货出库',
    value: 104,
}];

export const InOutTypeList: Obj[] = [...InTypeList, ...OutTypeList];
export const InOutTypeObject: Obj = {...InTypeObject, ...OutTypeObject};