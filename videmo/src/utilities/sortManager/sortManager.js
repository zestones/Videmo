class SortManager {
    filterByKeyword(keyword, object, ...keys) {
        return object.filter((element) => {
            for (const key of keys) {
                if (this.filterNestedString(keyword, element, key)) {
                    return true;
                }
            }
            return false;
        });
    }

    filterNestedString(keyword, object, key) {
        const keyParts = key.split('.');

        let value = object;
        for (const part of keyParts) {
            value = value[part];
            if (!value) return false;
        }

        return this.filterString(keyword, value);
    }

    filterString(keyword, value) {
        return value.toLowerCase().includes(keyword.toLowerCase());
    }
}

export default SortManager;