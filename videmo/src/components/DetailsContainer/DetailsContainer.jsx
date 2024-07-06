import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNotification } from "../../components/Notification/NotificationProvider";

// Constants
import { EXPLORE_STRING, HISTORY_STRING } from "../../utilities/utils/Constants";

// External
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';

// Api 
import SerieInfosApi from '../../services/api/serie/SerieInfosApi';
import SerieApi from '../../services/api/serie/SerieApi';
import AniList from '../../services/extenal/AniListService';

// Components
import CategoryModal from '../CategoryModal/CategoryModal';
import DetailsContainerSkeleton from './DetailsContainerSkeleton';

// Styles
import styles from './DetailsContainer.module.scss';


function DetailsContainer({ serie, calledFrom }) {
	// State initialization
	const [showModal, setShowModal] = useState(false);
	const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [showOptionPanel, setShowOptionPanel] = useState(false);

	const serieDataRef = useRef(serie); // We use a ref to store the fetched data

	// Initialization of the notification hook
	const { showNotification } = useNotification();

	// Api initialization
	const serieInfosApi = useMemo(() => new SerieInfosApi(), []);
	const serieApi = useMemo(() => new SerieApi(), []);
	const aniList = useMemo(() => new AniList(), []);

	useEffect(() => {
		const fetchAndUpdateSerieDetails = async () => {
			const fetchSerieDetails = async (searchName) => {
				return aniList.searchAnimeInfosName(searchName);
			}

			try {
				setIsLoading(true);
				const searchName = serie.basename === serie.name ? serie.basename : `${serie.basename} ${serie.name}`;
				const serieDetails = await fetchSerieDetails(searchName) || await fetchSerieDetails(serie.basename);

				serieDataRef.current = { ...serie, infos: serieDetails };
			} catch (error) {
				showNotification('error', error.message);
			} finally {
				setIsLoading(false);
			}
		}

		const readSerieInfos = async () => {
			try {
				setIsLoading(true);
				const serieInfos = await serieInfosApi.readSerieInfosById(serie.id);
				serieDataRef.current = { ...serie, infos: serieInfos };
			} catch (error) {
				showNotification('error', error.message);
			} finally {
				setIsLoading(false);
			}
		}

		const areAllValuesNullOrUndefined = (obj) => Object.values(obj).every(value => value === null || value === undefined);

		if (calledFrom === HISTORY_STRING && areAllValuesNullOrUndefined(serie.infos)) fetchAndUpdateSerieDetails();
		else if (calledFrom === HISTORY_STRING && !areAllValuesNullOrUndefined(serie.infos)) setIsLoading(false);
		else if (calledFrom === EXPLORE_STRING && !serie.inLibrary) fetchAndUpdateSerieDetails();
		else readSerieInfos();

	}, [aniList, showNotification, serie, serieInfosApi, calledFrom]);


	useEffect(() => {
		serieApi.readSerieByLink(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie?.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}, [serieApi, serie, showNotification]);

	const refreshSerieState = () => {
		serieApi.readSerieByLink(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie.inLibrary))
			.catch((error) => showNotification('error', error.message));
	}

	const toogleOptionPanel = () => setShowOptionPanel((prev) => !prev);
	const handleUpdateSerieInfos = async () => {
		try {
			setIsLoading(true);
			setShowOptionPanel(false);
			const infos = await aniList.searchAnimeInfosName(serie.basename);
			if (infos) {
				await serieInfosApi.updateSerieInfos(serie.link, infos);
				serieDataRef.current = { ...serie, infos: infos };
			}
		} catch (error) {
			showNotification('error', error.message);
		} finally {
			setIsLoading(false);
		}
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

				<div className={styles.options}>
					<span className={styles.optionsIcon} onClick={toogleOptionPanel}>
						{showOptionPanel ? <CloseIcon className={styles.icon} /> :
							<MoreHorizIcon className={styles.icon} />}
					</span>
					<div className={`${styles.optionsPanel} ${showOptionPanel ? styles.active : ''}`}>
						<div className={styles.optionsPanelContent}>
							<span className={styles.optionsPanelItem} onClick={() => setShowModal(true)}>Ajouter à ma liste</span>
							<span className={styles.optionsPanelItem} onClick={handleUpdateSerieInfos}>Mettre à jour les informations</span>
						</div>
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
								<span className={styles.genre} key={genre.name}>{genre.name}</span>
							))}
						</div>
					</div>

					<div className={styles.serieDetailsInfo}>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><StarIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieDataRef.current?.infos?.rating} / 10</span>
						</div>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><CalendarTodayIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieDataRef.current?.infos?.release_date}</span>
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
					series={[serieDataRef.current]}
					onClose={() => setShowModal(false)}
					onMoreClick={refreshSerieState}
					shouldUpdateSeries={calledFrom === EXPLORE_STRING}
				/>
			)}
		</div >
	);
};

export default DetailsContainer;
