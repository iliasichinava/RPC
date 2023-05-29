import { JSONRPCRequest, JSONRPCResponse, Mode, Transport } from "../../interfaces/rpc";

export class RPCClient {
  private transport: Transport;

  public constructor(transport: Transport) {
    this.transport = transport;
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
    return response.result; // Return the result of the RPC call
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
  public async ping(): Promise<boolean> {

    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      mode: Mode.Ping,
      method: "__ping__",
      id: "__ping__"
    };

    // Send the ping request and check the response status
    const response = await this.sendRequest(request);
    return response && response.result && response.result.status === 200;
  }

  /* Method for deleting the transport object */
  public delete(transport: Transport) {
    transport.delete();
  }

  /* PRIVATE */

  /* Method for generating a random request ID */
  private generateRequestId(): string {
    const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
    let size = 10;
    let id = '';

    while (0 < size--) {
      id += alphabet[(Math.random() * 64) | 0];
    }

    return id;
  }

  /* Method for sending an RPC request and receiving the response */
  private async sendRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    return new Promise<JSONRPCResponse>((resolve, reject) => {
      // Callback for transporter to handle incoming data
      const onDataCallback = (data: string) => {
        try {
          // Convert the received data as JSONRPCResponse
          const response: JSONRPCResponse = JSON.parse(data);
          if (response.id === request.id) {
            this.transport.onData(onDataCallback);
            resolve(response); // Resolve the promise with the response
          }
        } catch (error) {
          reject(error); // Reject if there is an error while parsing the response
        }
      };

      this.transport.onData(onDataCallback); // Register the onDataCallback on transport
      
       // Send the serialized request and handle possible errors
      this.transport
        .send(JSON.stringify(request))
        .catch(reject);
    });
  }  
}
