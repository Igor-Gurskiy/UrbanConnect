import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Login as LoginUI } from '../ui/Login/Login';
import { useDispatch } from '../../services/store';
import {
	loginUser,
	selectError,
	clearError,
} from '../../services/slices/Profile/Profile';
import { useSelector } from '../../services/store';
import { useLocation, useNavigate } from 'react-router-dom';

export const Login: FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [remember, setRemember] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();
	const error = useSelector(selectError);
	useEffect(() => {
		dispatch(clearError());
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);
	const handleSubmit = async () => {
		dispatch(clearError());
		await dispatch(loginUser({ email, password, remember })).unwrap();
		// navigate('/');
		const background = (location.state as { background?: Location })
			?.background;
		if (background) {
			navigate(-1); // закрываем модалку
		} else {
			navigate('/'); // или переходим на главную
		}
	};

	return (
		<LoginUI
			email={email}
			password={password}
			remember={remember}
			setRemember={setRemember}
			setEmail={setEmail}
			setPassword={setPassword}
			handleSubmit={handleSubmit}
			error={error}
		/>
	);
};
