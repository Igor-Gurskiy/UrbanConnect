export type TLogin = {
    email: string,
    password: string,
    setEmail: (value: string) => void,
    setPassword: (value: string) => void,
    handleSubmit: () => void,
    error: string | null
}