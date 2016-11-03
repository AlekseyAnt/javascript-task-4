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
        collection = functionItem(collection);
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

    function selectProperties(person) {
        var newPerson = {};
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];

            if (person.hasOwnProperty(property)) {
                newPerson[property] = person[property];
            }
        }

        return newPerson;
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
    function filterIn(collection) {
        return collection.filter(function (person) {
            return person.hasOwnProperty(property) && values.indexOf(person[property]) !== -1;
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
    function formatProperty(person) {
        var newPerson = {};
        Object.assign(newPerson, person);

        if (newPerson.hasOwnProperty(property)) {
            newPerson[property] = formatter(newPerson[property]);
        }

        return newPerson;
    }

    function format(collection) {
        return collection.map(formatProperty);
    }

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
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
            function addSuitablePersons(suitablePersons, functionItem) {
                return suitablePersons.concat(functionItem(collection));
            }

            var suitablePersons = filters.reduce(addSuitablePersons, []);

            return collection.filter(function (person) {
                return suitablePersons.indexOf(person) !== -1;
            });
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
            filters.forEach(function (functionItem) {
                collection = functionItem(collection);
            });

            return collection;
        }

        return and;
    };
}
