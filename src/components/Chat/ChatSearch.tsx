import { useCallback, useEffect, useRef, useState } from "react";
import { ChatSearchUI } from "../ui/ChatSearch/ChatSearch";
import { getUsersApi } from "../../utils/urbanConnect-api";
import type { TUser } from "../../utils/types";
import React from "react";

interface ChatSearchProps {
  search: string;
  setSearch: (search: string) => void;
  onUserSelect: (user: TUser) => void;
}
export const ChatSearch = React.memo(({search, setSearch, onUserSelect}: ChatSearchProps) => {
  const [users, setUsers] = useState<TUser[]>([]);
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     if (!search.trim()) {
  //       setUsers([]);
  //       return;
  //     }
  //     try {
  //       const usersFiltred = await getUsersApi({id: search}).then((data) => data.users);
  //       setUsers(usersFiltred);
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //       setUsers([]);
  //     } 
  //   };
  //   fetchUsers();
  // }, [search]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
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
    }, 300);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

  const handleUserSelect = useCallback((user: TUser) => {
    onUserSelect(user);
    setUsers([]);
  }, [onUserSelect]);

  return (
    <ChatSearchUI
      search={search}
      setSearch={setSearch}
      selectedUsers={users}
      onUserSelect={handleUserSelect}
    />
  );
});
