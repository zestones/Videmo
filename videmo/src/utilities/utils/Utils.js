export default class Utils {

    constructTitle(serie) {
        return (serie.basename !== serie.name) ? `${serie.basename} (${serie.name})` : serie.basename;
    }

    getDateFromTimestamp(timestamp) {
        const now = new Date();
        const entryDate = new Date(timestamp);

        if (
            entryDate.getDate() === now.getDate() &&
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
        ) {
            return 'Aujourd\'hui';
        } else if (
            entryDate.getDate() === now.getDate() - 1 &&
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
        ) {
            return 'Hier';
        } else {
            return entryDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    };

    getTimeFromTimestamp(timestamp) {
        const entryDate = new Date(timestamp);
        return entryDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    convertPlayedTime(playedTime) {
        const hours = Math.floor(playedTime / 3600);
        const minutes = Math.floor((playedTime - (hours * 3600)) / 60);
        const seconds = Math.floor(playedTime - (hours * 3600) - (minutes * 60));

        const displayTime = `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""} ${seconds ? seconds + "s" : ""}`;
        if (displayTime.trim(' ') === "") return "";
        return `• ${displayTime}`;
    };
}
