export interface IRPCClient {
    ping(): Promise<boolean>;
    notify(method: string, ...params: any): Promise<boolean>;
    call(method: string, params: any): Promise<unknown>;
}