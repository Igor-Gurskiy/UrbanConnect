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
		const abortControllerRef = useRef<AbortController | null>(null);

		const debounceSearch = useCallback(async (searchValue: string) => {
			if (!search.trim()) {
				setUsers([]);
				return;
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();

			try {
				const usersFiltred = await getUsersApi(
					{ id: searchValue },
					{ signal: abortControllerRef.current.signal }
				).then((data) => data.users);
				setUsers(usersFiltred);
			} catch (error) {
				console.error('Error fetching users:', error);
				setUsers([]);
			}
		}, []);

		useEffect(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				debounceSearch(search);
			}, 300);
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
				}
			};
		}, [search, debounceSearch]);

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
