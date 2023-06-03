import React, { useState } from 'react';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import SearchBar from './components/SearchBar/SearchBar';

function App() {
	const [pageTitle, setPageTitle] = useState('Accueil');

	const handlePageTitleChange = (title) => {
		setPageTitle(title);
	};

	return (
		<div className="App">
			<Header>
				<div className="headerLeft">
					<h1>{pageTitle}</h1>
				</div>
				<div className="headerRight">
					<SearchBar />
				</div>
			</Header>

			<Navigation onPageTitleChange={handlePageTitleChange} />
		</div>
	);
}

export default App;
