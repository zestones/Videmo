import { Utils } from "../../../utilities/utils/Utils";


describe('Utils', () => {
    let utils;

    beforeEach(() => {
        utils = new Utils();
    });

    test('constructTitle formats the title correctly when basename is different from name', () => {
        const serie = { basename: 'SeriesBasename', name: 'SeriesName' };
        const formattedTitle = utils.constructTitle(serie);
        expect(formattedTitle).toBe('SeriesBasename (SeriesName)');
    });

    test('constructTitle returns basename when basename is the same as name', () => {
        const serie = { basename: 'SameTitle', name: 'SameTitle' };
        const formattedTitle = utils.constructTitle(serie);
        expect(formattedTitle).toBe('SameTitle');
    });

    test('getDateFromTimestamp returns "Aujourd\'hui" for the current date', () => {
        const nowTimestamp = Date.now();
        const formattedDate = utils.getDateFromTimestamp(nowTimestamp);
        expect(formattedDate).toBe('Aujourd\'hui');
    });

    test('getDateFromTimestamp returns "Hier" for yesterday\'s date', () => {
        const yesterdayTimestamp = Date.now() - 86400000; // 86400000 ms = 1 day
        const formattedDate = utils.getDateFromTimestamp(yesterdayTimestamp);
        expect(formattedDate).toBe('Hier');
    });

    test('getDateFromTimestamp returns the formatted date for any other date', () => {
        const customTimestamp = new Date('2022-08-05').getTime(); // Use a fixed date for testing
        const formattedDate = utils.getDateFromTimestamp(customTimestamp);
        expect(formattedDate).toBe('5 août 2022');
    });

    test('getTimeFromTimestamp returns the formatted time', () => {
        const customTimestamp = new Date('2023-08-05T14:30:00').getTime(); // Use a fixed time for testing
        const formattedTime = utils.getTimeFromTimestamp(customTimestamp);
        expect(formattedTime).toBe('14:30');
    });

    test('convertPlayedTime formats the played time correctly', () => {
        const playedTimeInSeconds = 3665; // 1 hour, 1 minute, 5 seconds
        const formattedPlayedTime = utils.convertPlayedTime(playedTimeInSeconds);
        expect(formattedPlayedTime).toBe('• 1h 1m 5s');
    });

    test('convertPlayedTime returns empty string when played time is zero', () => {
        const playedTimeInSeconds = 0;
        const formattedPlayedTime = utils.convertPlayedTime(playedTimeInSeconds);
        expect(formattedPlayedTime).toBe('');
    });
});
