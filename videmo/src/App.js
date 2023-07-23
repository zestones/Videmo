import React, { useState } from 'react';

// External
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Components
import Navigation from './components/Navigation/Navigation';

// Pages
import Settings from './pages/More/Settings/Settings';
import Explore from './pages/Explore/Explore';
import Library from './pages/Library/Library';

// Styles
import './App.css';


function App() {
	const library = { library: { component: <Library />, icon: SubscriptionsIcon, label: "Bibliothèque" } };
	const explore = { explore: { component: <Explore />, icon: ExploreIcon, label: "Explorer" } };
	const history = { history: { component: <div>Historique</div>, icon: HistoryIcon, label: "Historique" } };
	const settings = { more: { component: <Settings />, icon: MoreHorizIcon, label: "Plus" } };

	const [activePage, setActivePage] =  useState(Object.keys(library)[0]);
	const navigationItems = { ...library, ...explore, ...history, ...settings };

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
