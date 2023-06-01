export enum Mode {
  Request,
  Notify,
  Ping,
}

export interface JSONRPCRequest {
  mode: Mode;
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
  [methodName: string]: (...params: any[]) => Promise<any> | any;
}

export interface ServerTransport {
  delete(): void;
  onData(handler: Function): void;
  start(): Promise<void>;
}
