'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


var priority = {
    'or': 1,
    'and': 2,
    'filterIn': 3,
    'sortBy': 4,
    'select': 5,
    'limit': 6,
    'format': 7
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var functions = [].slice.call(arguments).slice(1);

    functions = functions.filter(function (obj) {
        return typeof obj === 'function' && priority.hasOwnProperty(obj.name);
    });

    functions.sort(function (a, b) {
        return priority[a.name] - priority[b.name];
    });

    functions.forEach(function (f) {
        collection = f(collection);
    });

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = [].slice.call(arguments);

    function selectProperties(obj) {
        var newObj = {};
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];

            if (obj.hasOwnProperty(property)) {
                newObj[property] = obj[property];
            }
        }

        return newObj;
    }

    function select(collection) {
        return collection.map(selectProperties);
    }

    return select;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    function filterIn(collection) {
        return collection.filter(function (obj) {
            return obj.hasOwnProperty(property) && values.indexOf(obj[property]) !== -1;
        });
    }

    return filterIn;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    console.info(property, order);
    var i = (order === 'asc') ? 1 : -1;

    function compare(a, b) {
        if (a[property] > b[property]) {
            return i;
        }

        if (a[property] < b[property]) {
            return -1 * i;
        }

        return 0;
    }

    function sortBy(collection) {
        collection = collection.slice();

        return collection.sort(compare);
    }

    return sortBy;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    function fromatProperty(item) {
        var obj = {};
        Object.assign(obj, item);

        if (obj.hasOwnProperty(property)) {
            obj[property] = formatter(obj[property]);
        }

        return obj;
    }

    function format(collection) {
        return collection.map(fromatProperty);
    }

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    console.info(count);

    function limit(collection) {
        return collection.slice(0, count);
    }

    return limit;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        var filters = [].slice.call(arguments);

        function or(collection) {
            return filters.reduce(function (result, f) {
                var newCollection = f(collection).filter(function (value) {
                    return result.indexOf(value) === -1;
                });

                return result.concat(newCollection);
            }, []);
        }

        return or;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var filters = [].slice.call(arguments);

        function and(collection) {
            filters.forEach(function (f) {
                collection = f(collection);
            });

            return collection;
        }

        return and;
    };
}
