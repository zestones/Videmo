import React, { useState } from 'react';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import SearchBar from './components/SearchBar/SearchBar';

// Pages
import Settings from './pages/More/Settings/Settings';
import Explore from './pages/Explore/Explore';


function App() {
	const [pageTitle, setPageTitle] = useState('Accueil');
	const [searchValue, setSearchValue] = useState('');

	const handlePageTitleChange = (title) => {
		setPageTitle(title);
	};

	const handleSearch = (value) => {
		setSearchValue(value);
	};

	const navItems = {
		Accueil: 'Home Content',
		Bibliotheque: 'Library Content',
		Explorer: <Explore searchValue={searchValue} onPageTitleChange={handlePageTitleChange} />,
		Historique: 'History Content',
		Plus: <Settings />,
	};

	return (
		<div className="App">
			<Header>
				<div className="headerLeft">
					<h1>{pageTitle}</h1>
				</div>
				<div className="headerRight">
					<SearchBar onSearch={handleSearch} />
				</div>
			</Header>

			<Navigation navItems={navItems} onPageTitleChange={handlePageTitleChange} searchValue={searchValue} />
		</div>
	);
}

export default App;
