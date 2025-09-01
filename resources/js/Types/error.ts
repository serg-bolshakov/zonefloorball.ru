// types/error.ts
export interface ApiError {
    type: 'api';
    status?: number;
    data?: any;
}

export interface NetworkError {
    type: 'network';
    message: string;
}

export type RequestError = ApiError | NetworkError;

// Хук useCreateStick бросает RequestError