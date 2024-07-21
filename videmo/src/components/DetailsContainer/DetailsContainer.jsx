import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from "prop-types";

import { useNotification } from "../../components/Notification/NotificationProvider";

// Constants
import { EXPLORE_STRING, HISTORY_STRING, SOURCE_STRING } from "../../utilities/utils/Constants";

// External
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import LoopIcon from '@mui/icons-material/Loop';

// Api 
import SerieInfosApi from '../../services/api/serie/SerieInfosApi';
import SerieApi from '../../services/api/serie/SerieApi';
import AniList from '../../services/extenal/AniListService';

// Components
import CategoryModal from '../Modal/CategoryModal/CategoryModal';
import DetailsContainerSkeleton from './DetailsContainerSkeleton';

// Styles
import styles from './DetailsContainer.module.scss';
import EditDetailsModal from '../Modal/EditDetailsModal/EditDetailsModal';


function DetailsContainer({ serie, calledFrom }) {
	// State initialization
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);
	const [showOptionPanel, setShowOptionPanel] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [serieData, setSerieData] = useState(serie);

	// Initialization of the notification hook
	const { showNotification } = useNotification();

	// Api initialization
	const serieInfosApi = useMemo(() => new SerieInfosApi(), []);
	const serieApi = useMemo(() => new SerieApi(), []);
	const aniList = useMemo(() => new AniList(), []);

	const readSerieInfos = useCallback(async () => {
		try {
			setIsLoading(true);
			const serieInfos = await serieInfosApi.readSerieInfosById(serie.id);
			setSerieData({ ...serie, infos: serieInfos });
		} catch (error) {
			console.error(error);
			showNotification('error', error.message);
		} finally {
			setIsLoading(false);
		}
	}, [serie, serieInfosApi, showNotification]);

	useEffect(() => {
		const fetchAndUpdateSerieDetails = async () => {
			const fetchSerieDetails = async (searchName) => {
				return aniList.searchAnimeInfosName(searchName);
			}

			try {
				setIsLoading(true);
				const searchName = serie.basename === serie.name ? serie.basename : `${serie.basename} ${serie.name}`;
				const serieDetails = await fetchSerieDetails(searchName) || await fetchSerieDetails(serie.basename);
				setSerieData((prev) => ({ ...prev, infos: serieDetails }));
			} catch (error) {
				console.error(error);
				showNotification('error', error.message);
			} finally {
				setIsLoading(false);
			}
		}

		const areAllValuesNullOrUndefined = (obj) => Object.values(obj).every(value => value === null || value === undefined);

		if (calledFrom === HISTORY_STRING && areAllValuesNullOrUndefined(serie.infos)) fetchAndUpdateSerieDetails();
		else if (calledFrom === HISTORY_STRING && !areAllValuesNullOrUndefined(serie.infos)) setIsLoading(false);
		else if (calledFrom === (EXPLORE_STRING || SOURCE_STRING) && !serie.inLibrary) fetchAndUpdateSerieDetails();
		else readSerieInfos();

	}, [aniList, showNotification, serie, serieInfosApi, calledFrom, readSerieInfos]);

	useEffect(() => {
		serieApi.readSerieByLink(serie.link)
			.then((serie) => setAlreadyInLibrary(!!serie?.inLibrary))
			.catch((error) => {
				console.error(error);
				showNotification('error', error.message)
			});
	}, [serieApi, serie, showNotification]);

	const refreshSerieState = () => {
		serieApi.readSerieByLink(serie.link)
			.then((serie) => {
				setAlreadyInLibrary(!!serie.inLibrary);
				setSerieData(serie);
				readSerieInfos();
			})
			.catch((error) => {
				console.error(error);
				showNotification('error', error.message)
			});
	}

	const toogleOptionPanel = () => setShowOptionPanel((prev) => !prev);
	const handleUpdateSerieInfos = async () => {
		try {
			setIsLoading(true);
			setShowOptionPanel(false);
			const infos = await aniList.searchAnimeInfosName(serie.basename);
			if (infos) {
				if (serie.inLibrary) await serieInfosApi.updateSerieInfos(serie.link, infos);
				setSerieData((prev) => ({ ...prev, infos: infos }));
			}
		} catch (error) {
			console.error(error);
			showNotification('error', error.message);
		} finally {
			setIsLoading(false);
		}
	}


	return (
		<div className={styles.detailsContainer}>
			<DetailsContainerSkeleton isLoading={isLoading} >
				<div className={styles.serieBackground} >
					<img className={styles.serieImage} src={serieData.image} alt={serieData.basename} />
					<div className={styles.serieFavoriteContainer}>
						<span className={styles.serieFavoriteIcon} onClick={() => setShowCategoryModal(true)}>
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
							<button className={styles.optionsPanelItem} onClick={() => setShowCategoryModal(true)}>
								<AddIcon className={styles.optionsPanelItemIcon} />
								<span>Ajouter à ma liste</span>
							</button>
							<button className={styles.optionsPanelItem} onClick={handleUpdateSerieInfos}>
								<LoopIcon className={styles.optionsPanelItemIcon} />
								<span>Mettre à jour les informations</span>
							</button>
							<button className={styles.optionsPanelItem} onClick={() => setShowEditModal(true)}>
								<ModeEditIcon className={styles.optionsPanelItemIcon} />
								<span>Modifier les informations</span>
							</button>
						</div>
					</div>
				</div>

				<div className={styles.content}>
					<div className={styles.mainContent}>
						<h2 className={styles.title}>{serieData.basename}</h2>
						{serieData.basename && serieData.basename !== serieData.name && (
							<h4 className={styles.subtitle}>{serieData.name}</h4>
						)}

						<p className={styles.description} dangerouslySetInnerHTML={{ __html: serieData?.infos?.description }}></p>

						<div className={styles.genres}>
							{serieData?.infos?.genres?.map((genre, _) => (
								<span className={styles.genre} key={genre.name}>{genre.name}</span>
							))}
						</div>
					</div>

					<div className={styles.serieDetailsInfo}>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><StarIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieData?.infos?.rating} / 10</span>
						</div>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><CalendarTodayIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieData?.infos?.release_date}</span>
						</div>
						<div className={styles.serieDetailsInfoItem}>
							<span className={styles.serieDetailsInfoItemIcon}><WatchLaterIcon /></span>
							<span className={styles.serieDetailsInfoItemLabel}>{serieData?.infos?.duration}</span>
						</div>
					</div>
				</div>
			</DetailsContainerSkeleton>
			{showCategoryModal && (
				<CategoryModal
					series={[serieData]}
					onClose={() => setShowCategoryModal(false)}
					onRefresh={refreshSerieState}
					shouldUpdateSeries={calledFrom === EXPLORE_STRING || calledFrom === SOURCE_STRING}
				/>
			)}

			{showEditModal && (
				<EditDetailsModal
					serie={serieData}
					onClose={() => {
						setShowEditModal(false);
						setShowOptionPanel(false);
					}}
					onRefresh={refreshSerieState}
				/>
			)}
		</div >
	);
};

DetailsContainer.propTypes = {
	serie: PropTypes.object.isRequired,
	calledFrom: PropTypes.string.isRequired,
};

export default DetailsContainer;
