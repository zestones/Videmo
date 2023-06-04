import React, { useState } from 'react';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import SearchBar from './components/SearchBar/SearchBar';

function App() {
	const [pageTitle, setPageTitle] = useState('Accueil');
	const [searchValue, setSearchValue] = useState('');

	const handlePageTitleChange = (title) => {
		setPageTitle(title);
	};

	const handleSearch = (value) => {
		setSearchValue(value);
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

			<Navigation onPageTitleChange={handlePageTitleChange} searchValue={searchValue} />
		</div>
	);
}

export default App;
