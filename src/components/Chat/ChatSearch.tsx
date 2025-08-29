import { useEffect, useState } from "react";
import { ChatSearchUI } from "../ui/ChatSearch/ChatSearch";
import { getUsersApi, type TUser } from "../../utils/urbanConnect-api";

interface ChatSearchProps {
  search: string;
  setSearch: (search: string) => void;
  onUserSelect: (user: TUser) => void;
}
export const ChatSearch = ({search, setSearch, onUserSelect}: ChatSearchProps) => {
  const [users, setUsers] = useState<TUser[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }
      try {
        const usersFiltred = await getUsersApi({id: search}).then((data) => data.users);
        setUsers(usersFiltred);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } 
    };
    fetchUsers();
  }, [search]);

  return (
    <ChatSearchUI
      search={search}
      setSearch={setSearch}

      selectedUsers={users}

      onUserSelect={onUserSelect}
    />
  );
};

// "id": "2c9be4ad-1326-4e00-92db-9ddd850969e8"
// "id": "6e116e86-6d00-4d7a-9bd4-1580ddb5aaa1",
// "id": "8a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
