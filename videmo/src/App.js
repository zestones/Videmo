import React, { useState } from 'react';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import SearchBar from './components/SearchBar/SearchBar';
import BackArrow from './components/BackArrow/BackArrow';

// Pages
import Settings from './pages/More/Settings/Settings';
import Explore from './pages/Explore/Explore';
import Library from './pages/Library/Library';

// Utilities
import FolderManager from './utilities/folderManager/FolderManager';

function App() {
	const [folderManager] = useState(() => new FolderManager());

	const [selectedExtension, setSelectedExtension] = useState(null);
	const [activePage, setActivePage] = useState('Bibliotheque');
	const [headerTitle, setHeaderTitle] = useState(activePage);

	const [searchValue, setSearchValue] = useState('');
	const [currentLevel, setCurrentLevel] = useState(0);
	const [currentPath, setCurrentPath] = useState('');
	const [folderContents, setFolderContents] = useState([]);
	const [showBackButton, setShowBackButton] = useState(false);
	const [showSerieDetails, setShowSerieDetails] = useState(false);
	const [serieDetails, setSerieDetails] = useState(null); // [title, image, description, gennres...]
	const [episodesFiles, setEpisodesFiles] = useState([]);


	const handleSearch = (value) => {
		setSearchValue(value);
	};

	const handlePageTitleChange = (title) => {
		setHeaderTitle(title);

		if (navItems.hasOwnProperty(title)) {
			setActivePage(title);
		}

		if (currentLevel === 0 && title === 'Explorer') {
			setShowBackButton(false);
			setSelectedExtension(null);
		}
	};

	const navItems = {
		Bibliotheque: <Library searchValue={searchValue} />,
		Explorer: <Explore
			searchValue={searchValue}
			onPageTitleChange={handlePageTitleChange}
			onSelectedExtensionChange={setSelectedExtension}
			onCurrentLevelChange={setCurrentLevel}
			onCurrentPathChange={setCurrentPath}
			onFolderContentsChange={setFolderContents}
			onShowBackButtonChange={setShowBackButton}
			onShowSerieDetailsChange={setShowSerieDetails}
			onSerieDetailsChange={setSerieDetails}
			onEpisodesFilesChange={setEpisodesFiles}
			episodesFiles={episodesFiles}
			showSerieDetails={showSerieDetails}
			serieDetails={serieDetails}
			folderContents={folderContents}
			currentLevel={currentLevel}
			selectedExtension={selectedExtension}
			folderManager={folderManager}
		/>,
		Historique: 'History Content',
		Plus: <Settings />,
	};

	// ! ATTENTION: ONLY WORK FOR LOCAL FILES
	// Function to update serie details
	const updateSerieDetails = (parentPath, level) => {
		folderManager.retrieveFolderCover(parentPath, level - 1)
			.then((cover) => {
				// TODO: Retrieve serie real details
				const title = folderManager.retrieveFileName(parentPath);
				const img = folderManager.accessFileWithCustomProtocol(cover);
				setSerieDetails({ name: title, image: img, description: serieDetails.description, genres: serieDetails.genres, basename: serieDetails.basename });
			})
			.catch((error) => console.error(error));
	};

	const handleBackClick = async () => {
		if (currentLevel > 0) {
			setEpisodesFiles([]); // Hide episode list (on back click list episode is impossible)

			try {
				const parentPath = await folderManager.retrieveParentPath(currentPath);
				const level = await folderManager.retrieveLevel(selectedExtension.link, parentPath);
				const data = await folderManager.retrieveFolderContents(parentPath, level);

				setFolderContents(data.contents);
				setCurrentLevel(currentLevel - 1);
				setCurrentPath(parentPath);

				if (currentLevel === 1) {
					setShowSerieDetails(false);
				} else if (currentLevel > 1) {
					setShowSerieDetails(true);
					updateSerieDetails(parentPath, level);
				}
			} catch (error) {
				console.error(error);
			}
		} else {
			handlePageTitleChange("Explorer");
		}
	};

	return (
		<div className="App">
			<Header>
				<div className="headerLeft">
					{showBackButton && <BackArrow handleClick={handleBackClick} />}
					<h1>{headerTitle}</h1>
				</div>
				<div className="headerRight">
					<SearchBar onSearch={handleSearch} />
				</div>
			</Header>
			<Navigation
				navItems={navItems}
				onPageTitleChange={handlePageTitleChange}
				activePage={activePage}
			/>
		</div>
	);
}

export default App;
