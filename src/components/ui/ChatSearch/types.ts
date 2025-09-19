import type { TUser } from '../../../utils/types';

export type TChatSearch = {
	search: string;
	setSearch: (value: string) => void;
	selectedUsers: TUser[];
	onUserSelect: (user: TUser) => void;
};
