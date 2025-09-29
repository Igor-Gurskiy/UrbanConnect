import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from './services/store';
import { AppHeader } from './components/AppHeader/index';
import './App.scss';
import { Modal } from './components/Modal/index';
import { Register } from './components/Register/index';
import { Login } from './components/Login/index';
import { getUser, setAuthChecked } from './services/slices/Profile/Profile';
import { getCookie, deleteCookie } from './utils/cookies';
import { ProtectedRoute } from './components/protected-route';
import { HomePage } from './components/homePage/homePage';
import { ChatListPage } from './components/Chat/ChatListPage';
import { GroupChat } from './components/Chat/GroupChat';
import { ChatDialogPage } from './components/Chat/ChatDialogPage';
import { ChatLayout } from './components/Chat/ChatLayout';
import { EditGroup } from './components/Chat/EditGroup';
import { AddMember } from './components/Chat/AddMember';
import { Profile } from './components/Profile/Profile';

function App() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);

	useEffect(() => {
		const updateHeaderHeight = () => {
			if (headerRef.current) {
				const height = headerRef.current.offsetHeight;
				setHeaderHeight(height);
			}
		};

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(updateHeaderHeight);
		});

		if (headerRef.current) {
			resizeObserver.observe(headerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	useEffect(() => {
		const accessToken = getCookie('accessToken');
		const refreshToken = localStorage.getItem('refreshToken');

		if (accessToken || refreshToken) {
			dispatch(getUser())
				.unwrap()
				.catch((error) => {
					console.error('Authorization failed:', error);
					deleteCookie('accessToken');
					localStorage.removeItem('refreshToken');
					dispatch(setAuthChecked(true));
				});
		} else {
			dispatch(setAuthChecked(true));
		}
	}, [dispatch]);

	const location = useLocation();
	const locationState = location.state as { background?: Location };
	const background = locationState && locationState.background;
	const handleModalClose = () => {
		navigate(-1);
	};

	return (
		<>
			<AppHeader ref={headerRef} />
			<Routes location={background || location}>
				<Route path="/" element={<HomePage />} />
				<Route
					path="/login"
					element={
						<ProtectedRoute onlyUnAuth>
							<Login />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/signup"
					element={
						<ProtectedRoute onlyUnAuth>
							<Register />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/chat"
					element={
						<ProtectedRoute>
							<ChatLayout headerHeight={headerHeight} />
						</ProtectedRoute>
					}
				>
					<Route index element={<ChatListPage />} />
					<Route path="new-group" element={<GroupChat />} />
					<Route path=":id" element={<ChatDialogPage />} />
					<Route path=":id/edit-group" element={<EditGroup />} />
					<Route path=":id/add-member" element={<AddMember />} />
				</Route>
				{/* Другие роуты вашего приложения */}
			</Routes>
			{background && (
				<Routes>
					<Route
						path="/chat/:id/edit-group"
						element={
							<Modal type="Edit Group" handleCancel={handleModalClose}>
								<EditGroup />
							</Modal>
						}
					/>
					<Route
						path="/chat/:id/add-member"
						element={
							<Modal type="Add Member" handleCancel={handleModalClose}>
								<AddMember />
							</Modal>
						}
					/>
				</Routes>
			)}
		</>
	);
}

export default App;
