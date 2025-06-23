export type TChat = {
    name: string
    avatar?: string,
    lastMessage: TMessage
}

export type TMessage = {
    id: number,
    text: string,
    createdAt: string,
    user: string
}

export type TChatList = {
    chats: TChat[]
}