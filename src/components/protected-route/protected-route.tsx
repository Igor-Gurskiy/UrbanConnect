import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';
import {
	selectIsAuthChecked,
	selectUser,
} from '../../services/slices/Profile/Profile';

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
		return <div>Loading...</div>;
	}

	if (onlyUnAuth && user) {
		return <Navigate to="/" replace />;
	}

	if (!onlyUnAuth && !user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};
