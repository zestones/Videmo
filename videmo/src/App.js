import React, { useState, useEffect } from 'react';

// Contexts
import { NotificationProvider } from './components/Notification/NotificationProvider';
import { useTheme } from './pages/More/Settings/ThemeSettings/ThemeContext';
import { DisplayModeProvider } from './components/FilterPanel/DisplayOptions/DisplayModeContext';


// External
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryIcon from '@mui/icons-material/History';

// Components
import Navigation from './components/Navigation/Navigation';

// Pages
import Settings from './pages/More/Settings/Settings';
import Explore from './pages/Explore/Explore';
import Library from './pages/Library/Library';
import History from './pages/History/History';
import Update from './pages/Update/Update';

// Styles
import './App.css';


function App() {
	const library = { library: { component: <Library />, icon: SubscriptionsIcon, label: "Bibliothèque" } };
	const explore = { explore: { component: <Explore />, icon: ExploreIcon, label: "Explorer" } };
	const history = { history: { component: <History />, icon: HistoryIcon, label: "Historique" } };
	const settings = { more: { component: <Settings />, icon: MoreHorizIcon, label: "Plus" } };
	const update = { update: { component: <Update />, icon: NewReleasesIcon, label: "Nouveautés" } };

	const { theme } = useTheme();

	const [activePage, setActivePage] = useState(Object.keys(library)[0]);
	const navigationItems = { ...library, ...update, ...explore, ...history, ...settings };


	useEffect(() => {
		document.body.className = theme;
	}, [theme]);

	return (
		<div className={`App ${theme}`}>
			<NotificationProvider>
				<DisplayModeProvider>
					<Navigation
						navItems={navigationItems}
						activePage={activePage}
						onPageChange={setActivePage}
					/>
				</DisplayModeProvider>
			</NotificationProvider>
		</div>
	);
}

export default App;
