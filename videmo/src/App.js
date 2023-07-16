import React, { useState } from 'react';

// Styles
import './App.css';

// Components
import Navigation from './components/Navigation/Navigation';

// Pages
import Settings from './pages/More/Settings/Settings';
import Explore from './pages/Explore/Explore';
import Library from './pages/Library/Library';

function App() {
	const [activePage, setActivePage] = useState('Bibliotheque');

	const navigationItems = {
		Bibliotheque: <Library />,
		Explorer: <Explore />,
		Historique: 'History Content',
		Plus: <Settings />,
	}

	return (
		<div className="App">
			<Navigation
				navItems={navigationItems}
				activePage={activePage}
				onPageChange={setActivePage}
			/>
		</div>
	);
}

export default App;
