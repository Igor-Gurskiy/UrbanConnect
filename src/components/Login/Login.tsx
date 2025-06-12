import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Login as LoginUI } from '../ui/Login/Login';
import { useDispatch } from '../../services/store';
import { loginUser, selectError, clearError } from '../../services/slices/Profile/Profile';
import { useSelector } from '../../services/store';
import { useNavigate } from 'react-router-dom';


export const Login: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const error = useSelector(selectError);
    useEffect(() => {
        dispatch(clearError());
        return () => {dispatch(clearError())};
    }, [dispatch]);
    const handleSubmit = async () => {
        dispatch(clearError());
        await dispatch(loginUser({ email, password })).unwrap();
        navigate(-1);
    };

    return <LoginUI email={email} password={password} setEmail={setEmail} setPassword={setPassword} handleSubmit={handleSubmit} error={error}/>;
};