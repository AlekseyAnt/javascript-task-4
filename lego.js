'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


var PRIORITY = {
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
    var functions = [].slice.call(arguments, 1);

    functions = functions.filter(function (functionItem) {
        return typeof functionItem === 'function' && PRIORITY.hasOwnProperty(functionItem.name);
    });

    functions.sort(function (a, b) {
        return PRIORITY[a.name] - PRIORITY[b.name];
    });

    functions.forEach(function (functionItem) {
        switch (functionItem.name) {
            case 'or':
            case 'and':
            case 'filterIn':
                collection = collection.filter(functionItem);
                break;
            case 'select':
            case 'format':
                collection = collection.map(functionItem);
                break;
            default:
                collection = functionItem(collection);
        }
    });

    return collection;
};

function selectProperties(item, properties) {
    var newItem = {};
    for (var i = 0; i < properties.length; i++) {
        var property = properties[i];

        if (item.hasOwnProperty(property)) {
            newItem[property] = item[property];
        }
    }

    return newItem;
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = [].slice.call(arguments);

    return function select(item) {
        return selectProperties(item, properties);
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(item) {
        return item.hasOwnProperty(property) && values.indexOf(item[property]) !== -1;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
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
    function format(item) {
        var newItem = selectProperties(item, Object.keys(item));

        if (newItem.hasOwnProperty(property)) {
            newItem[property] = formatter(newItem[property]);
        }

        return newItem;
    }

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
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

        function or(item) {
            return filters.reduce(function (result, filter) {
                return result || filter(item);
            }, false);

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

        function and(item) {
            return filters.reduce(function (result, filter) {
                return result && filter(item);
            }, true);

        }

        return and;
    };
}
