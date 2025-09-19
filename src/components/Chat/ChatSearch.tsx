import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ChatSearchUI } from '../ui/ChatSearch/ChatSearch';
import { getUsersApi } from '../../utils/urbanConnect-api';
import type { TUser } from '../../utils/types';

interface ChatSearchProps {
	search: string;
	setSearch: (search: string) => void;
	onUserSelect: (user: TUser) => void;
}

export const ChatSearch = memo(
	({ search, setSearch, onUserSelect }: ChatSearchProps) => {
		const [users, setUsers] = useState<TUser[]>([]);
		const timeoutRef = useRef<NodeJS.Timeout | null>(null);

		useEffect(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			if (!search.trim()) {
				setUsers([]);
				return;
			}

			timeoutRef.current = setTimeout(async () => {
				try {
					const usersFiltred = await getUsersApi({ search: search }).then(
						(data) => data.users
					);
					setUsers(usersFiltred);
				} catch (error) {
					console.error('Error fetching users:', error);
					setUsers([]);
				}
			}, 300);

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, [search]);

		const handleUserSelect = useCallback(
			(user: TUser) => {
				onUserSelect(user);
				setUsers([]);
				setSearch('');
			},
			[onUserSelect, setSearch]
		);

		return (
			<ChatSearchUI
				search={search}
				setSearch={setSearch}
				selectedUsers={users}
				onUserSelect={handleUserSelect}
			/>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.search === nextProps.search &&
			prevProps.setSearch === nextProps.setSearch &&
			prevProps.onUserSelect === nextProps.onUserSelect
		);
	}
);
