export default class Utils {

    constructTitle(serie) {
        return (serie.basename !== serie.name) ? `${serie.basename} (${serie.name})` : serie.basename;
    }

    getDateFromTimestamp(timestamp) {
        const now = new Date();
        const entryDate = new Date(timestamp);

        const timeDifference = Math.floor((now - entryDate) / (1000 * 60 * 60 * 24));

        if (timeDifference === 0) return "Aujourd'hui";
        else if (timeDifference === 1) return "Hier";
        else {
            // Use toLocaleDateString for any other date
            return entryDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    }

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
