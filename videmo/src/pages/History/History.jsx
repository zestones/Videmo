import React, { useState, useEffect } from "react";

// Components
import Header from "../../components/Header/Header";

// Services
import HistoryApi from "../../services/api/track/HistoryApi";

// Styles
import styles from "./History.module.scss";


function History() {
    // Services initialization
    const [historyApi] = useState(() => new HistoryApi());

    // State initialization
    const [history, setHistory] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        // Fetch the history
        historyApi.retrieveAllEpisodeAndSerieHistory()
            .then((data) => {
                setHistory(data);
                console.log(data);
            })
            .catch((error) => {
                console.log(error);
            });

    }, [historyApi]);

    // TODO : dislay the history in a list of cards
    return (
        <div className={styles.history}>
            <Header
                title="Historique"
                onSearch={setSearchValue}
            />

            <div className={styles.history__content}>
            </div>
        </div>
    );
}

export default History;