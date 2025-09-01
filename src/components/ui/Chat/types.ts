import type { TMessage, TUser } from "../../../utils/types"

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


