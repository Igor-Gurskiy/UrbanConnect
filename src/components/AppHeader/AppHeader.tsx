import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader as AppHeaderUI } from '../ui/AppHeader/AppHeader';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser, logoutUser } from '../../services/slices/Profile/Profile';

export const AppHeader = forwardRef<HTMLHeadElement>((_, ref) => {
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
			ref={ref}
			username={username}
			handleLogin={handleLogin}
			handleSignup={handleSignup}
			handleLogout={handleLogout}
		/>
	);
});
