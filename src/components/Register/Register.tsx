import { type FC, useState, useEffect } from 'react';
import { Register as RegisterUI } from '../ui/Register/Register';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import {
	registerUser,
	selectError,
	clearError,
} from '../../services/slices/Profile/Profile';
import { useSelector } from '../../services/store';

export const Register: FC = () => {
	const error = useSelector(selectError);
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		dispatch(clearError());
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = async () => {
		dispatch(clearError());
		await dispatch(
			registerUser({
				name: userName,
				email: email,
				password: password,
			})
		).unwrap();
		navigate(-1);
	};

	return (
		<RegisterUI
			username={userName}
			email={email}
			password={password}
			setUsername={setUserName}
			setEmail={setEmail}
			setPassword={setPassword}
			handleSubmit={handleSubmit}
			error={error}
		/>
	);
};
