import { MealtimeList } from '@/global/const';
import _utils from '@/utils/index';
import { timestampFilter } from '@/utils/Dayjs';

export const currentWeek = _utils.getCurrentWeekRange();
export const currentWeeks = _utils.getCurrentWeeks(currentWeek.start);

export const setWeekMealtimeFormat = (data: Obj) => {
    let weekData: Obj = {}, weekMealtimes: Obj[] = [];

    /** 餐次 */
    function mealtypeFilter() {
        const mealtypes = data.meal_types.split(',');
        for (const type of mealtypes) {
            const mealTypeObject = MealtimeList[type];
            weekMealtimes.push({
                name: mealTypeObject.name,
                value: mealTypeObject.value,
                data: [],
            });
        }
    };
    mealtypeFilter();

    if (data && Reflect.ownKeys(data).length > 0) {
        for (const item of currentWeeks) {
            const mealtimes = JSON.parse(JSON.stringify(weekMealtimes));
            weekData[item.date] = {
                date: item.date,
                week: item.week,
                mealtimes,
            };
        }
    }
    return { weekData, weekMealtimes };
};

export const onRecipeWeekDataFilter = (data: Obj) => {
    let weekData: Obj = {}, weekMealtimes: Obj[] = [], weekChecked: Obj = {};

    if (data && Reflect.ownKeys(data).length > 0) {
        weekChecked = {
            id: data.id,
            name: data.recipe_name,
            weekStart: data.date_start,
            weekEnd: data.date_end,
        };

        /** 星期 */
        function weekFilter(date: string) {
            const timestamp = timestampFilter(date);
            const day = new Date(timestamp).getDay();
            return _utils.weekDays[day];
        }
        /** 餐次 */
        function mealtypeFilter() {
            const mealtypes = data.meal_types.split(',');
            for (const type of mealtypes) {
                const mealTypeObject = MealtimeList[type];
                weekMealtimes.push({
                    name: mealTypeObject.name,
                    value: mealTypeObject.value,
                    data: [],
                });
            }
        };
        mealtypeFilter();
        /** 分类 */
        function mealtimesFilter(array: Obj[]) {
            const mealtimes = JSON.parse(JSON.stringify(weekMealtimes)) ?? [];
            if (Array.isArray(array)) {
                for (const item of array) {
                    const object = mealtimes.find((el: Obj) => el.value === item.meal_types);
                    object.data.push({
                        id: item.dish_id,
                        name: item.dish_name,
                    });
                }
            }
            return mealtimes;
        }

        for (const item of data.list) {
            weekData[item.date] = {
                date: item.date,
                week: weekFilter(item.date),
                mealtimes: mealtimesFilter(item.list),
            };
        }
    }
    return { weekData, weekMealtimes, weekChecked }
};
