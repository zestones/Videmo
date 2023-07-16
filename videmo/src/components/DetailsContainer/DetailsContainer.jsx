import React, { useState, useEffect } from 'react';

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faStar, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';

// Api 
import SerieApi from '../../services/api/serie/SerieApi';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';

// Styles
import styles from './DetailsContainer.module.scss';


const DetailsContainer = ({ serie }) => {
	// State initialization
	const [showModal, setShowModal] = useState(false);
	const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);
	
	// Api initialization
	const [serieApi] = useState(() => new SerieApi());

	const details = [
		{ icon: <FontAwesomeIcon icon={faStar} mask={['far', 'circle']} size="xs" />, label: serie.rating },
		{ icon: <FontAwesomeIcon icon={faCalendar} mask={['far', 'circle']} size="xs" />, label: serie.startDate },
		{ icon: <FontAwesomeIcon icon={faClock} mask={['far', 'circle']} size="xs" />, label: serie.duration },
	];

	useEffect(() => {
		serieApi.readSerieBySerieObject(serie)
			.then((serie) => setAlreadyInLibrary(serie ? true : false))
			.catch((error) => console.error(error));
	}, [serieApi, serie]);

	const refreshSerieState = () => {
		serieApi.readSerieBySerieObject(serie)
			.then((data) => setAlreadyInLibrary(data ? true : false))
			.catch((error) => console.error(error));
	}

	return (
		<div className={styles.detailsContainer}>
			<div className={styles.serieBackground} >
				<img className={styles.serieImage} src={serie.image} alt="Serie" />
				<div className={styles.serieFavoriteContainer}>
					<span className={styles.serieFavoriteIcon} onClick={() => setShowModal(true)}>
						<FontAwesomeIcon className={`${styles.serieFavorite} ${alreadyInLibrary ? styles.active : ''}`} icon={faHeart} />
					</span>
					<p className={styles.serieFavoriteLabel}>Ajouter à ma liste</p>
				</div>
			</div>

			<div className={styles.content}>
				<div className={styles.mainContent}>
					<h2 className={styles.title}>{serie.basename}</h2>
					{serie.basename && serie.basename !== serie.name && (
						<h4 className={styles.subtitle}>{serie.name}</h4>
					)}

					<p className={styles.description} dangerouslySetInnerHTML={{ __html: serie?.description }}></p>

					<div className={styles.genres}>
						{serie?.genres?.map((genre, index) => (
							<span className={styles.genre} key={index}>
								{genre}
							</span>
						))}
					</div>
				</div>

				<div className={styles.serieDetailsInfo}>
					{details.map((item, index) => (
						<div className={styles.serieDetailsInfoItem} key={index}>
							<span className={styles.serieDetailsInfoItemIcon}>{item.icon}</span>
							<span className={styles.serieDetailsInfoItemLabel}>{item.label}</span>
						</div>
					))}
				</div>
			</div>
			{showModal && (
				<CategoryModal
					serie={serie}
					onClose={() => setShowModal(false)}
					onMoreClick={refreshSerieState}
				/>
			)}
		</div>
	);
};

export default DetailsContainer;
