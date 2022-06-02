import { createContext, ReactNode } from "react";
import { api } from "../services/api";

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(cresentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode
}

//diego@rocketseat.team

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const isAuthenticated = false;

    const signIn = async ({ email, password }: SignInCredentials) => {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })
            console.log(response.data);
        } catch (e) {
            alert("Erro");
        }

    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}