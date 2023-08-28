import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNotification } from "../../components/Notification/NotificationProvider";

// External
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WatchLaterIcon from '@mui/icons-material/WatchLater';

// Api 
import SerieApi from '../../services/api/serie/SerieApi';
import AniList from '../../services/extenal/AniListService';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';
import DetailsContainerSkeleton from './DetailsContainerSkeleton';

// Styles
import styles from './DetailsContainer.module.scss';


function DetailsContainer({ serie, isCalledFromExplore }) {
	// State initialization
	const [showModal, setShowModal] = useState(false);
	const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const serieDataRef = useRef(serie); // We use a ref to store the fetched data


	// Initialization of the notification hook
	const { showNotification } = useNotification();

	// Api initialization
	const serieApi = useMemo(() => new SerieApi(), []);
	const aniList = useMemo(() => new AniList(), []);

	useEffect(() => {
		async function fetchAndUpdateSerieDetails() {
			const fetchSerieDetails = async (searchName) => {
				return aniList.searchAnimeInfosName(searchName);
			}

			try {
				setIsLoading(true);

				const searchName = serie.basename === serie.name ? serie.basename : `${serie.basename} ${serie.name}`;
				let serieDetails = await fetchSerieDetails(searchName);

				if (!serieDetails) {
					serieDetails = await fetchSerieDetails(serie.basename);
				}

				const updatedSerieData = { ...serie, infos: serieDetails };
				serieDataRef.current = updatedSerieData;
			} catch (error) {
				showNotification('error', error.message);
			} finally {
				setIsLoading(false);
			}
		}

		// TODO : add a condition - isCalledFromExplore
		fetchAndUpdateSerieDetails();
	}, [aniList, showNotification, serie]);


	useEffect(() => {
		serieApi.readSerieBySerieObject(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie?.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}, [serieApi, serie, showNotification]);

	const refreshSerieState = () => {
		serieApi.readSerieBySerieObject(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}

	return (
		<div className={styles.detailsContainer}>
			<DetailsContainerSkeleton isLoading={isLoading} >
				<div className={styles.serieBackground} >
					<img className={styles.serieImage} src={serieDataRef.current.image} alt={serieDataRef.current.basename} />
					<div className={styles.serieFavoriteContainer}>
						<span className={styles.serieFavoriteIcon} onClick={() => setShowModal(true)}>
							<FavoriteIcon className={`${styles.serieFavorite} ${alreadyInLibrary ? styles.active : ''}`} />
						</span>
						<p className={styles.serieFavoriteLabel}>Ajouter à ma liste</p>
					</div>
				</div>

				<div className={styles.content}>
					<div className={styles.mainContent}>
						<h2 className={styles.title}>{serieDataRef.current.basename}</h2>
						{serieDataRef.current.basename && serieDataRef.current.basename !== serieDataRef.current.name && (
							<h4 className={styles.subtitle}>{serieDataRef.current.name}</h4>
						)}

						<p className={styles.description} dangerouslySetInnerHTML={{ __html: serieDataRef.current?.infos?.description }}></p>

						<div className={styles.genres}>
							{serieDataRef.current?.infos?.genres?.map((genre, _) => (
								<span className={styles.genre} key={genre.name}>
									{genre.name}
								</span>
							))}
						</div>
					</div>

					<div className={styles.serieDetailsInfo}>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><StarIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieDataRef.current?.infos?.rating}</span>
						</div>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><CalendarTodayIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieDataRef.current?.infos?.releaseDate}</span>
						</div>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><WatchLaterIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieDataRef.current?.infos?.duration}</span>
						</div>
					</div>
				</div>
			</DetailsContainerSkeleton>
			{showModal && (
				<CategoryModal
					serie={serieDataRef.current}
					onClose={() => setShowModal(false)}
					onMoreClick={refreshSerieState}
					shouldUpdateSeries={isCalledFromExplore}
				/>
			)}
		</div >
	);
};

export default DetailsContainer;
