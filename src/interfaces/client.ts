import { JSONRPCRequest, JSONRPCResponse } from "./rpc";

export interface IRPCClient {
  ping(): Promise<boolean>;
  notify(method: string, ...params: any): Promise<boolean>;
  call(method: string, params: any): Promise<unknown>;
}

export interface ClientTransport {
  send(data: JSONRPCRequest): Promise<boolean>;
  delete(): void;
  start(): Promise<void>;
  setResponseHander(handler: Function): void;
}
