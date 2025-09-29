import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import {
	selectIsAuthChecked,
	selectUser,
} from '../../services/slices/Profile/Profile';
import { Loader } from '../Loader/Loader';

type ProtectedRouteProps = {
	onlyUnAuth?: boolean;
	children: React.ReactNode;
};

export const ProtectedRoute = ({
	children,
	onlyUnAuth = false,
}: ProtectedRouteProps) => {
	const location = useLocation();
	const user = useSelector(selectUser);
	const isAuthChecked = useSelector(selectIsAuthChecked);
	if (!isAuthChecked) {
		return <Loader />;
	}

	if (onlyUnAuth && user) {
		const from = location.state?.from?.pathname || '/';
		return <Navigate replace to={from} />;
	}

	if (!onlyUnAuth && !user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return children;
};
