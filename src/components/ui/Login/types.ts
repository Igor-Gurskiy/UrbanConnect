export type TLogin = {
    email: string,
    password: string,
    remember: boolean,
    setEmail: (value: string) => void,
    setPassword: (value: string) => void,
    setRemember: (value: boolean) => void,
    handleSubmit: () => void,
    error: string | null
}