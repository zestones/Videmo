
class sortManager {

    filterArrayByString(searchString, stringArray) {
        return stringArray.filter((element) => this.filterString(searchString, element));
    }

    filterString(searchString, string) {
        return string.toLowerCase().includes(searchString.toLowerCase());
    }
}

export default sortManager;