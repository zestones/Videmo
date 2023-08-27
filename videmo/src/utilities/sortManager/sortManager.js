class SortManager {

    filterByKeyword(keyword, objectKey, object) {
        return object.filter((element) => this.filterString(keyword, element[objectKey]));
    }

    filterArrayByString(searchString, stringArray) {
        return stringArray.filter((element) => this.filterString(searchString, element));
    }

    filterString(searchString, string) {
        return string.toLowerCase().includes(searchString.toLowerCase());
    }
}

export default SortManager;