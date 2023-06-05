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

// Utilities
import FolderManager from './utilities/folderManager/FolderManager';

function App() {
	const [selectedExtension, setSelectedExtension] = useState(null);
	const [folderManager] = useState(() => new FolderManager());
	const [activePage, setActivePage] = useState('Accueil');
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
		Accueil: 'Home Content',
		Bibliotheque: 'Library Content',
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
	const handleBackClick = () => {
		if (currentLevel > 0) {
			setEpisodesFiles([]); // Hide episode list (on back click list episode is impossible)
			// Retrieve the parent folder path
			folderManager.retrieveParentPath(currentPath)
				.then((parentPath) => {
					// Retrieve the parent folder level
					folderManager.retrieveLevel(selectedExtension.link, parentPath)
						.then((level) => {
							folderManager.retrieveFolderContents(parentPath, level)
								.then((data) => {
									setFolderContents(data);
									setCurrentLevel(currentLevel - 1);
									setCurrentPath(parentPath); // Set currentPath to the parent folder
									if (currentLevel === 1) {
										setShowSerieDetails(false);
									} else if (currentLevel > 1) {
										setShowSerieDetails(true);
										folderManager.retrieveFolderCover(parentPath, level - 1)
											.then((cover) => {
												// TODO: Retrieve serie real details
												const title = folderManager.getFileName(parentPath);
												const img = folderManager.getCoverImage(cover); 
												setSerieDetails({ title: title, image: img, description: serieDetails.description, genres: serieDetails.genres});
											})
											.catch((error) => console.error(error));
									}
								})
								.catch((error) => console.error(error));
						})
						.catch((error) => console.error(error));
				})
				.catch((error) => console.error(error));
		} else {
			handlePageTitleChange("Explorer");
		}
	};

	return (
		<div className="App">
			<Header>
				<div className="headerLeft">
					{showBackButton && (
						<BackArrow handleClick={handleBackClick} />
					)}
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
