export type TUser = {
    id: string,
    name: string,
    email: string,
    avatar?: string
}

export type TChatSearch = {
    search: string,
    setSearch: (value: string) => void,
    selectedUsers: TUser[],
    onUserSelect: (user: TUser) => void
}