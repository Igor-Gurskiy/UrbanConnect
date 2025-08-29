import { Input, List } from "antd";
import type { TUser, TChatSearch } from './types';
import type { FC } from "react";

export const ChatSearchUI: FC<TChatSearch> = ({search, setSearch, selectedUsers, onUserSelect}) => {
    // const avatarContent = (user: TUser) => {
    //     if (user?.avatar === undefined) return null;
    //     return user.name?.slice(0, 1).toUpperCase();
    //   };

    return (
    <div style={{ padding: '16px', position: 'relative' }}>
      <Input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search by user ID..."
        style={{}}
      />
      
      {search.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '16px',
          right: '16px',
          zIndex: 100,
          maxHeight: '20vh',
          overflowY: 'auto',
          background: '#ebebebff',
        }}>
          {selectedUsers.length > 0 ? (
            <List
              size="small"
              dataSource={selectedUsers}
              renderItem={(user: TUser) => (
                <List.Item
                  style={{ 
                    cursor: 'pointer',
                    padding: '0px 12px',
                    border: '1px solid #f0f0f0',
                    marginBottom: '4px',
                  }}
                  onClick={() => onUserSelect(user)}
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
              )}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: '16px 12px 16px',
              fontSize: '14px'
            }}>
              Пользователь с ID "{search}" не найден
            </div>
          )}
        </div>
      )}
    </div>
  );
};