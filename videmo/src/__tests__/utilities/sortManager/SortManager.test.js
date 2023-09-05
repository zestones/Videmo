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

    test('filterByKeyword filters the object array correctly', () => {
        const searchString = 'apple';
        const objectArray = [
            { name: 'This is an Apple' },
            { name: 'Banana' },
            { name: 'Orange' },
            { name: 'This is an apple pie' },
        ];
        const filteredArray = sortManager.filterByKeyword(searchString, objectArray, 'name');
        expect(filteredArray).toEqual([
            { name: 'This is an Apple' },
            { name: 'This is an apple pie' },
        ]);
    });

    test('filterByKeyword filters the object array case-insensitively', () => {
        const searchString = 'orange';
        const objectArray = [
            { name: 'This is an Apple' },
            { name: 'Banana' },
            { name: 'Orange' },
            { name: 'This is an orange juice' },
        ];
        const filteredArray = sortManager.filterByKeyword(searchString, objectArray, 'name');
        expect(filteredArray).toEqual([
            { name: 'Orange' },
            { name: 'This is an orange juice' },
        ]);
    });

    test('filterByKeyword returns an empty array if no match is found', () => {
        const searchString = 'grape';
        const objectArray = [
            { name: 'This is an Apple' },
            { name: 'Banana' },
            { name: 'Orange' },
            { name: 'This is an orange juice' },
        ];
        const filteredArray = sortManager.filterByKeyword(searchString, objectArray, 'name');
        expect(filteredArray).toEqual([]);
    });
});