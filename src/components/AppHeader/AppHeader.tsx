import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader as AppHeaderUI } from '../ui/AppHeader/AppHeader';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser, logoutUser } from '../../services/slices/Profile/Profile';

export const AppHeader: FC = () => {
	const username = useSelector(selectUser)?.name || '';
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const handleLogin = () => navigate('/login');
	const handleSignup = () => navigate('/signup');
	const handleLogout = () => {
		dispatch(logoutUser());
	};
	return (
		<AppHeaderUI
			username={username}
			handleLogin={handleLogin}
			handleSignup={handleSignup}
			handleLogout={handleLogout}
		/>
	);
};
