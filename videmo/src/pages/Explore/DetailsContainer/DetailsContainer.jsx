import React from 'react';

// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';


// Styles
import styles from './DetailsContainer.module.scss';

const DetailsContainer = ({ image, title, description, genres, details }) => {
	// TODO: Query to check if already inside library or not
	return (
		<div className={styles.detailsContainer}>
			<div className={styles.serieBackground} >
				<img className={styles.serieImage} src={image} alt="Serie" />
				<div className={styles.serieFavoriteContainer}>
					<span className={styles.serieFavoriteIcon}>
						<FontAwesomeIcon className={styles.serieFavorite} icon={faHeart} />
					</span>
					<p className={styles.serieFavoriteLabel}>Ajouter à ma liste</p>
				</div>
			</div>
			<div className={styles.content}>
				<div className={styles.mainContent}>
					<h2 className={styles.title}>{title}</h2>
					<p className={styles.description}>{description}</p>

					<div className={styles.genres}>
						{genres.map((genre, index) => (
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
		</div>
	);
};

export default DetailsContainer;
