import React from "react";
import type { TMessage } from "../../../utils/types";
import { Typography } from "antd";

interface TMessageItem {
  item: TMessage;
  isCurrentUser: boolean;
}

export const MessageItemUI = React.memo(
  ({ item, isCurrentUser }: TMessageItem) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: isCurrentUser ? "flex-end" : "flex-start",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "60%",
            padding: "8px 12px",
            borderRadius: isCurrentUser
              ? "18px 18px 0 18px"
              : "18px 18px 18px 0",
            backgroundColor: isCurrentUser ? "#1890ff" : "#e6e6e6",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Paragraph
            style={{
              margin: 0,
              fontSize: "1rem",
              color: isCurrentUser ? "#fff" : "#000",
            }}
          >
            {item.text}
          </Typography.Paragraph>
          <div
            style={{
              fontSize: "10px",
              textAlign: "right",
              color: isCurrentUser ? "#fff" : "#000",
              alignContent: "flex-end",
            }}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  }
);
