import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

// 
import SerieInfosApi from "../../../services/api/serie/SerieInfosApi";
import SortManager from "../../../utilities/sortManager/SortManager";

// Styles
import styles from "./EditDetailsModal.module.scss";

function EditDetailsModal({ serie, onClose, onRefresh }) {
    const serieInfosApi = useMemo(() => new SerieInfosApi(), []);
    const sortManager = useMemo(() => new SortManager(), []);

    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState(serie.infos.genres);

    useEffect(() => {
        serieInfosApi.readGenres()
            .then((data) => setGenres(sortManager.sortByName(data)))
            .catch((error) => console.error(error));
    }, [serieInfosApi, sortManager]);


    const handleGenreChange = (genre) => {
        setSelectedGenres((prev) =>
            prev.some((g) => g.id === genre.id)
                ? prev.filter((g) => g.id !== genre.id)
                : [...prev, genre]
        );
    };

    const handleSaveInfos = () => {
        const infos = {
            description: document.getElementById("description").value,
            duration: document.getElementById("duration").value,
            rating: document.getElementById("rating").value,
            release_date: document.getElementById("release_date").value,
            basename: document.getElementById("title").value,
            genres: selectedGenres
        };

        // change date to format mm/dd/yyyy
        const [year, month, day] = infos.release_date.split('-');
        infos.release_date = `${month}/${day}/${year}`;

        serieInfosApi.updateSerieInfos(serie.link, infos)
            .then(() => {
                onRefresh();
                onClose();
            })
            .catch((error) => console.error(error));
    };

    // TODO: FORMAT DATE IN DB
    const convertDate = (date) => {
        if (!date) return date
        const [month, day, year] = date.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return formattedDate;
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Edit Information</h2>
                    <span className={styles.close} onClick={onClose}>&times;</span>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.content}>
                        <div className={styles.modalContentItem}>
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" name="title" defaultValue={serie.basename} />
                        </div>
                        <div className={styles.modalContentItem}>
                            <span>Genres</span>
                            <div className={styles.genresContainer}>
                                {genres.map((genre) => (
                                    <div key={genre.id} className={styles.genreItem}>

                                        <input
                                            type="checkbox"
                                            id={`genre-${genre.id}`}
                                            checked={selectedGenres.some((g) => g.id === genre.id)}
                                            onChange={() => handleGenreChange(genre)}
                                        />
                                        <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.modalContentItem}>
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" defaultValue={serie.infos.description} />
                        </div>
                        <div className={styles.modalContentItem}>
                            <label htmlFor="rating">Rating</label>
                            <input type="number" id="rating" name="rating" defaultValue={serie.infos.rating} />
                        </div>
                        <div className={styles.modalContentGroupedItem}>
                            <div className={styles.modalContentItem}>
                                <label htmlFor="releaseDate">Release date</label>
                                <input type="date" id="release_date" name="releaseDate" defaultValue={convertDate(serie.infos.release_date)} />
                            </div>
                            <div className={styles.modalContentItem}>
                                <label htmlFor="duration">Duration</label>
                                <input type="text" id="duration" name="duration" defaultValue={serie.infos.duration} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSaveInfos}>Save</button>
                </div>
            </div>
        </div>
    );
}

EditDetailsModal.propTypes = {
    serie: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired
};

export default EditDetailsModal;