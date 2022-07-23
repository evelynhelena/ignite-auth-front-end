import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';

interface FailedRequestQueue {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void;
};

interface AxiosErrorResponse {
    code?: string;
}
let isRefreshing = false;
let failedRequestsQueue = Array<FailedRequestQueue>();

export function setupApiClient(ctx : GetServerSidePropsContext | undefined = undefined){

    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`,
        }
    });
    
    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError<AxiosErrorResponse>) => {
        if (error.response?.status === 401) {
            if (error.response.data?.code === "token.expired") {
                //renovar token
                cookies = parseCookies(ctx);
                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config
    
                if (!isRefreshing) {
                    isRefreshing = true;
    
                    api.post('/refresh', { refreshToken }).then(response => {
                        const { token } = response.data;
    
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 25 * 30,
                            path: '/'
                        });
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 25 * 30,
                            path: '/'
                        });
    
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
                        failedRequestsQueue.forEach(request => request.onSuccess(token));
                        failedRequestsQueue = [];
    
                    }).catch(err => {
                        failedRequestsQueue.forEach(request => request.onFailure(err));
                        failedRequestsQueue = [];
    
                        if(process.browser){
                            signOut();
                        }
                    }).finally(() => {
                        isRefreshing = false;
                    });
                }
    
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            if (!originalConfig?.headers) {
                                return
                            }
    
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;
                            resolve(api(originalConfig));
    
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        }
                    })
                });
    
            } else {
                signOut(); 
            }
        }
       return Promise.reject(error);
    })

    return api;
}