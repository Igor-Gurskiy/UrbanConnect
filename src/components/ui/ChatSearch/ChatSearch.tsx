import { Input, List } from 'antd';
import type { TChatSearch } from './types';
import type { FC } from 'react';
import type { TUser } from '../../../utils/types';
import React, { memo, useCallback } from 'react';

export const ChatSearchUI: FC<TChatSearch> = memo(
	({ search, setSearch, selectedUsers, onUserSelect }) => {
		const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(e.target.value);
		};

		const handleUserSelect = (user: TUser) => {
			onUserSelect(user);
		};

		const renderUserItem = useCallback(
			(user: TUser) => (
				<List.Item
					style={{
						cursor: 'pointer',
						padding: '0px 12px',
						border: '1px solid #f0f0f0',
						marginBottom: '4px',
					}}
					onClick={() => handleUserSelect(user)}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '';
					}}
				>
					<List.Item.Meta
						title={user.name.replace('-', ' ')}
						description={`ID: ${user.id}`}
					/>
				</List.Item>
			),
			[handleUserSelect]
		);

		return (
			<div style={{ padding: '4px', position: 'relative' }}>
				<Input
					value={search}
					onChange={handleSearchChange}
					placeholder="Search by user ID..."
					style={{}}
				/>

				{search.length > 0 && (
					<div
						style={{
							position: 'absolute',
							top: '100%',
							left: '16px',
							right: '16px',
							zIndex: 100,
							maxHeight: '20vh',
							overflowY: 'auto',
							background: '#ebebebff',
						}}
					>
						{selectedUsers.length > 0 ? (
							<List
								size="small"
								dataSource={selectedUsers}
								renderItem={renderUserItem}
							/>
						) : (
							<div
								style={{
									textAlign: 'center',
									color: '#666',
									padding: '16px 12px 16px',
									fontSize: '14px',
								}}
							>
								Пользователь с ID "{search}" не найден
							</div>
						)}
					</div>
				)}
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.search === nextProps.search &&
			prevProps.selectedUsers === nextProps.selectedUsers &&
			prevProps.onUserSelect === nextProps.onUserSelect &&
			prevProps.setSearch === nextProps.setSearch
		);
	}
);
