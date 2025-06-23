export type TChat = {
    name: string,
    isOnline: boolean
    avatar?: string,
    onSend: (text: string) => void,
    messages: TMessage[],
    user: string,
    handleSmileClick: () => void,
    handleFileAttach: () => void
}

export type TMessage = {
    id: number,
    text: string,
    createdAt: string,
    user: string
}