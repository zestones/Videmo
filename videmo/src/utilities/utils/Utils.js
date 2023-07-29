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
}
