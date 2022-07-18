import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from 'nookies';

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(cresentials: SignInCredentials): Promise<void>;
    user: User | undefined,
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

//diego@rocketseat.team

export const AuthContext = createContext({} as AuthContextData);

 export function signOut() {
    destroyCookie(undefined, 'nextauth.token');
    destroyCookie(undefined, 'nextauth.refreshToken');

    Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | undefined>();
    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me')
                .then((response) => {
                    const { email, permissions, roles } = response.data;
                    setUser({
                        email,
                        permissions,
                        roles
                    })
                }).catch(() => {
                    signOut();
                })
        }

    }, [])

    const signIn = async ({ email, password }: SignInCredentials) => {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data;
            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 25 * 30,
                path: '/'
            });
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 25 * 30,
                path: '/'
            });
            setUser({
                email,
                permissions,
                roles
            })

            api.interceptors.request.use(
                async (config) => {
                  config.headers = {
                    Authorization: `Bearer ${token}`,
                  };
        
                  return config;
                },
                (error) => Promise.reject(error)
              );

            Router.push('/dashboard');
        } catch (e) {
            alert("Usuário ou senha incorreto");
        }

    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}