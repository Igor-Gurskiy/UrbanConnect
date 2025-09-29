import { NavLink } from 'react-router-dom';
import { forwardRef, useMemo, useState } from 'react';
import type { TAppHeader } from './types';
import { Button, Drawer, Image, Menu } from 'antd';
import logo from '../../../images/logo.png';
import { MenuOutlined } from '@ant-design/icons';
import { useWindowSize } from '../../../hooks/useWindowSize';

export const AppHeader = forwardRef<HTMLHeadElement, TAppHeader>(
	({ username, handleLogin, handleSignup, handleLogout }, ref) => {
		const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

		const { width } = useWindowSize();

		const toggleMobileMenu = () => {
			setMobileMenuOpen(!isMobileMenuOpen);
		};

		const closeMobileMenu = () => {
			setMobileMenuOpen(false);
		};
		const mobileMenu = useMemo(() => {
			if (width <= 576) {
				return (
					<>
						<div className="col d-flex d-sm-none justify-content-start">
							<Button
								type="text"
								icon={<MenuOutlined />}
								onClick={toggleMobileMenu}
								className="border-0"
							/>
						</div>
						<Drawer
							title="Menu"
							classNames={{
								header: 'my-classname',
								body: 'my-body-classname',
							}}
							placement="left"
							onClose={closeMobileMenu}
							open={isMobileMenuOpen}
							width={'50%'}
							styles={{
								header: {
									padding: '0.5rem',
								},
								body: {
									padding: '0.5rem',
									textAlign: 'center',
								},
							}}
						>
							<Menu mode="vertical" className="border-0 p-0">
								<Menu.Item key="chat" onClick={closeMobileMenu} className="p-0">
									<NavLink to={'/chat'} className="text-decoration-none">
										Chat
									</NavLink>
								</Menu.Item>
								<Menu.Item key="map" onClick={closeMobileMenu} className="p-0">
									<NavLink to={'/map'} className="text-decoration-none">
										Map
									</NavLink>
								</Menu.Item>
							</Menu>
						</Drawer>
					</>
				);
			}
			return null;
		}, [width, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu]);

		const desktopNav = useMemo(() => {
			if (width > 576) {
				return (
					<div className="gap-4 col d-none d-sm-flex justify-content-start">
						<NavLink to={'/chat'}>
							<p className="text-center m-0">Chat</p>
						</NavLink>
						<NavLink to={'/map'}>
							<p className="text-center m-0">Map</p>
						</NavLink>
					</div>
				);
			}
			return null;
		}, [width]);

		const authButtons = useMemo(() => {
			return username ? (
				<>
					<NavLink to={'/profile'} className="text-decoration-none ">
						<p className="text-center m-0 rainbow-bootstrap">{username}</p>
					</NavLink>
					<Button type="default" onClick={handleLogout}>
						Log out
					</Button>
				</>
			) : (
				<>
					<Button type="default" onClick={handleLogin}>
						Log in
					</Button>
					<Button type="default" onClick={handleSignup}>
						Sign up
					</Button>
				</>
			);
		}, [username, handleLogin, handleSignup, handleLogout]);

		return (
			<header className="p-3 container" ref={ref}>
				<nav className="row border-bottom p-2 align-items-center">
					{/* Бургер-меню для мобильных */}
					{mobileMenu}
					{desktopNav}

					{/* Логотип */}
					<div className="col-auto">
						<NavLink to={'/'}>
							<Image
								preview={false}
								src={logo}
								alt="logo"
								style={{ maxWidth: '100px' }}
							/>
						</NavLink>
					</div>

					{/* Кнопки авторизации */}
					<div className="gap-4 col d-flex flex-column flex-sm-row justify-content-end align-items-center">
						{authButtons}
					</div>
				</nav>
			</header>
		);
	}
);
