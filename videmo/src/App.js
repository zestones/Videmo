import React, { useState, useEffect } from 'react';

// Contexts
import { NotificationProvider } from './components/Notification/NotificationProvider';
import { useTheme } from './pages/More/Settings/ThemeSettings/ThemeContext';
import { DisplayModeProvider } from './components/FilterPanel/DisplayOptions/DisplayModeContext';


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
import History from './pages/History/History';

// Styles
import './App.css';


function App() {
	const library = { library: { component: <Library />, icon: SubscriptionsIcon, label: "Bibliothèque" } };
	const explore = { explore: { component: <Explore />, icon: ExploreIcon, label: "Explorer" } };
	const history = { history: { component: <History />, icon: HistoryIcon, label: "Historique" } };
	const settings = { more: { component: <Settings />, icon: MoreHorizIcon, label: "Plus" } };

	const { theme } = useTheme();
	const [pageHeight, setPageHeight] = useState(0);

	const [activePage, setActivePage] = useState(Object.keys(library)[0]);
	const navigationItems = { ...library, ...explore, ...history, ...settings };


	useEffect(() => {
		const handleResize = () => {
			setPageHeight(document.documentElement.scrollHeight);
		};

		window.addEventListener('resize', handleResize);
		setPageHeight(document.documentElement.scrollHeight);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
	}, [pageHeight]);


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
