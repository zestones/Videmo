import SortManager from "../../../utilities/sortManager/sortManager";


describe('SortManager', () => {
    let sortManager;

    beforeEach(() => {
        sortManager = new SortManager();
    });

    test('filterString returns true if the searchString matches the string', () => {
        const searchString = 'apple';
        const string = 'This is an Apple';
        const result = sortManager.filterString(searchString, string);
        expect(result).toBe(true);
    });

    test('filterString returns true if the searchString matches the string case-insensitively', () => {
        const searchString = 'orange';
        const string = 'This is an Orange';
        const result = sortManager.filterString(searchString, string);
        expect(result).toBe(true);
    });

    test('filterString returns false if the searchString does not match the string', () => {
        const searchString = 'banana';
        const string = 'This is an Apple';
        const result = sortManager.filterString(searchString, string);
        expect(result).toBe(false);
    });

    test('filterArrayByString filters the array correctly', () => {
        const searchString = 'apple';
        const stringArray = ['This is an Apple', 'Banana', 'Orange', 'This is an apple pie'];
        const filteredArray = sortManager.filterArrayByString(searchString, stringArray);
        expect(filteredArray).toEqual(['This is an Apple', 'This is an apple pie']);
    });

    test('filterArrayByString filters the array case-insensitively', () => {
        const searchString = 'orange';
        const stringArray = ['This is an Apple', 'Banana', 'Orange', 'This is an orange juice'];
        const filteredArray = sortManager.filterArrayByString(searchString, stringArray);
        expect(filteredArray).toEqual(['Orange', 'This is an orange juice']);
    });

    test('filterArrayByString returns an empty array if no match is found', () => {
        const searchString = 'grape';
        const stringArray = ['This is an Apple', 'Banana', 'Orange', 'This is an orange juice'];
        const filteredArray = sortManager.filterArrayByString(searchString, stringArray);
        expect(filteredArray).toEqual([]);
    });
});
