class DataTypesConverter {
    constructor() {
        this._dataTypes = {
            string: 'TEXT',
            number: 'REAL',
            boolean: 'INTEGER',
            object: 'TEXT',
            array: 'TEXT',
            null: 'NULL'
        };
    }

    convertToSqliteDataType(dataType) {
        return this._dataTypes[dataType];
    }

    convertToSqliteValue(value) {
        if (value === null) {
            return null;
        }

        const dataType = typeof value;
        switch (dataType) {
            case 'string':
                return value;
            case 'number':
                return value;
            case 'boolean':
                return this.convertBooleanToInteger(value);
            case 'object':
                return JSON.stringify(value);
            case 'array':
                return JSON.stringify(value);
            default:
                throw new Error(`Unknown data type: ${dataType}`);
        }
    }

    convertIntegerToBoolean(value) {
        return value === 1;
    }

    convertBooleanToInteger(value) {
        return value ? 1 : 0;
    }

    formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
        return date.format(format);
    }
}

module.exports = DataTypesConverter;