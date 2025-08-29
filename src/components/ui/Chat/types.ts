import { type TUser } from '../../../utils/urbanConnect-api';
export type TChatDialog = {
    name: string,
    isOnline: boolean
    avatar?: string,
    onSend: (message: string) => void,
    messages: TMessage[],
    user: TUser | null,
    type: string,
    handleSmileClick: () => void,
    handleFileAttach: () => void
}
export type TMessage = {
    id: string,
    text: string,
    createdAt: string,
    user: string
}

