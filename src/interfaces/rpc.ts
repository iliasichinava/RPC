export enum Mode { Request, Notify, Ping }

export interface JSONRPCRequest {
    mode: Mode,
    jsonrpc: string;
    method: string;
    params?: any[];
    id?: string | number | null;
}

export interface JSONRPCResponse {
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: string | number | null;
}

export interface JSONRPCHandler {
    [methodName: string]: (...params: any[]) => Promise<any>;
}

export interface Transport {
    delete(): unknown;
    onData(callback: (data: string) => void): void;
    send(data: string): Promise<JSONRPCResponse>;
}