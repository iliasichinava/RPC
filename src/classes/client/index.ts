import { JSONRPCRequest, JSONRPCResponse, Transport } from "../../interfaces/rpc";

export class RPCClient {
  private transport: Transport;

  public constructor(transport: Transport) {
    this.transport = transport;
  }

  public async call(method: string, params?: any[]): Promise<any> {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id: this.generateRequestId(),
    };

    const response = await this.sendRequest(request);
    return response.result;
  }

  public async notify(method: string, params?: any[]): Promise<void> {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      method,
      params,
    };

    await this.sendRequest(request);
  }

  public async ping(): Promise<boolean> {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      method: "__ping__",
      id: "__ping__"
    };
    const response = await this.sendRequest(request);
    return response && response.result && response.result.status === 200;
  }

  private generateRequestId(): string {
    const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
    let size = 10;
    let id = '';

    while (0 < size--) {
        id += alphabet[(Math.random() * 64) | 0];
    }

    return id;
  }

  private async sendRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    return new Promise<JSONRPCResponse>((resolve, reject) => {
      const onDataCallback = (data: string) => {
        try {
          const response: JSONRPCResponse = JSON.parse(data);
          if (response.id === request.id) {
            this.transport.onData(onDataCallback);
            resolve(response);
          }
        } catch (error) {
          reject(error);
        }
      };
      this.transport.onData(onDataCallback);
      this.transport.send(JSON.stringify(request))
        .catch(reject);
    });
  }
  
}
