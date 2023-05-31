import {
  JSONRPCRequest,
  JSONRPCHandler,
  Transport,
  Mode,
  JSONRPCResponse,
} from "../../interfaces/rpc";
import { Invoker } from "./commands";

export class RPCServer {
  private invoker: Invoker; // Instance of the Invoker class for handling RPC method invocations
  private transportsQueue: Transport[]; // Queue to hold the registered transports

  /* PUBLIC METHODS */

  public constructor(transports: Transport);
  public constructor(transports: Transport[]);
  public constructor(transports: Transport | Transport[]) {
    this.invoker = new Invoker(new Map<string, JSONRPCHandler>());
    this.transportsQueue = Array.isArray(transports)
      ? transports
      : [transports];
  }

  /* Main method for running the RPC server */
  public async run(): Promise<void> {
    this.registerPingMethod();

    for (const transport of this.transportsQueue) {
      console.info("Transport registered!");
      this.addIncomeRequestHandlerToTransports(transport); // Add each transport to the server
      await transport.start();
    }
  }

  /* Method for registering an RPC method with a handler function */
  public expose(method: string, handler: JSONRPCHandler): void {
    this.invoker.register(method, handler);
    console.log(`Method ${method} has been registered`);
  }

  /* Method for removing an RPC method */
  public removeMethod(method: string): void {
    if (this.invoker.handlers.has(method)) {
      this.invoker.handlers.delete(method);
    }
    console.log(`No method exists called "${method}"`);
  }

  /* Method for adding a transport to the server */
  private addIncomeRequestHandlerToTransports(transport: Transport): this {
    transport.onData(this.handleIncomeRequest.bind(this));

    return this;
  }

  public addNewTransport(transport: Transport) {
    this.transportsQueue.push(transport);
  }

  private async handleIncomeRequest(data: string) {
    const request: JSONRPCRequest = JSON.parse(data);
    await this.handleRequest(request);
  }

  /* Method for removing a transport from the server */
  public removeTransport(transport: Transport): void {
    transport.delete();
  }

  /* PRIVATE METHODS */

  /* Method for handling an RPC request */
  private async handleRequest(
    request: JSONRPCRequest
  ): Promise<JSONRPCResponse | void> {
    const response = await this.invoker.invoke(request);
    if (request.mode !== Mode.Notify) return response;
  }

  /* Method for registering the ping method */
  private registerPingMethod() {
    const handler: JSONRPCHandler = {
      __ping__: async () => {
        return { status: 200 };
      },
    };

    this.expose("__ping__", handler);
  }
}
