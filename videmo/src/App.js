import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './components/Notification/NotificationProvider';
import { useTheme } from './pages/More/Settings/ThemeSettings/ThemeContext';

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

	const [activePage, setActivePage] = useState(Object.keys(library)[0]);
	const navigationItems = { ...library, ...explore, ...history, ...settings };

	useEffect(() => {
        // Apply the theme class to the root element (body)
        document.body.className = theme || 'default'; // 'default' is the fallback theme
    }, [theme]);

	return (
		<div className={`App ${theme === 'default' ? '' : theme}`}>
			<NotificationProvider>
				<Navigation
					navItems={navigationItems}
					activePage={activePage}
					onPageChange={setActivePage}
				/>
			</NotificationProvider>
		</div>
	);
}

export default App;
