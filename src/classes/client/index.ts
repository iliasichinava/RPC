import { ClientTransport } from "./../../interfaces/client";
import { JSONRPCRequest, JSONRPCResponse, Mode } from "../../interfaces/rpc";

export class RPCClient {
  private clientTransport: ClientTransport;
  public constructor(clietTransport: ClientTransport) {
    this.clientTransport = clietTransport;
  }

  /* Method for making an RPC call with expecting response */
  public async call(method: string, params?: any[]): Promise<any> {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      mode: Mode.Request,
      method,
      params,
      id: this.generateRequestId(),
    };

    // Send the request and get the response
    const response = await this.sendRequest(request);
    return response; // Return the result of the RPC call
  }

  /* Method for user to send an RPC notification without expecting any response */
  public async notify(method: string, params?: any[]): Promise<void> {
    // Create an RPC request object
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      mode: Mode.Notify,
      method,
      params,
    };

    // Send the request without expecting a response
    await this.sendRequest(request);
  }

  /* Method for user to ping the RPC server */
  public async ping(): Promise<void> {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      mode: Mode.Ping,
      method: "__ping__",
      id: "__ping__",
    };

    // Send the ping request and check the response status
    await this.sendRequest(request);

    // return response && response.result && response.result.status === 200;
  }

  /* Method for deleting the clietTransport object */
  public delete(clietTransport: ClientTransport) {
    clietTransport.delete();
  }

  /* PRIVATE */

  /* Method for generating a random request ID */
  private generateRequestId(): string {
    const alphabet =
      "bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz";
    let size = 10;
    let id = "";

    while (0 < size--) {
      id += alphabet[(Math.random() * 64) | 0];
    }

    return id;
  }

  /* Method for sending an RPC request and receiving the response */
  private async sendRequest(request: JSONRPCRequest): Promise<void> {
    await this.clientTransport.send(request);
  }

  private responseHandler(response: string) {
    console.log(JSON.parse(response), "[response from server] \n");
  }
  public async start() {
    this.clientTransport.setResponseHander(this.responseHandler.bind(this));
    await this.clientTransport.start();
  }
}
