import { JSONRPCRequest, JSONRPCHandler, Transport, Mode } from "../../interfaces/rpc";
import { Invoker } from "./commands";

export class RPCServer {
  private invoker: Invoker; // Instance of the Invoker class for handling RPC method invocations
  private transportsQueue: Transport[]; // Queue to hold the registered transports

  /* PUBLIC METHODS */

  public constructor(transports: Transport);
  public constructor(transports: Transport[]);
  public constructor(transports: Transport | Transport[]) {
    this.invoker = new Invoker(new Map<string, JSONRPCHandler>());
    this.transportsQueue = Array.isArray(transports) ? transports : [transports];
  }

  /* Main method for running the RPC server */
  public run(): void {
    this.registerPingMethod();

    for (const transport of this.transportsQueue) {
      console.info("Transport registered!");
      this.addTransport(transport); // Add each transport to the server
    }

    this.transportsQueue = []; // Clear the transports queue
  }

  /* Method for registering an RPC method with a handler function */
  public registerMethod(method: string, handler: JSONRPCHandler): void {
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
  public addTransport(transport: Transport): this {
    console.log("New transport has been registered");
    transport.onData(async (data: string) => {
      const request: JSONRPCRequest = JSON.parse(data);
      await this.handleRequest(transport, request);
    });
    return this;
  }

  /* Method for removing a transport from the server */
  public removeTransport(transport: Transport): void {
    transport.delete();
  }

  /* PRIVATE METHODS */

  /* Method for handling an RPC request */
  private async handleRequest(transport: Transport, request: JSONRPCRequest): Promise<void> {
    const response = await this.invoker.invoke(request);
    if (request.mode !== Mode.Notify) await transport.send(JSON.stringify(response));
  }

  /* Method for registering the ping method */
  private registerPingMethod() {
    const handler: JSONRPCHandler = {
      __ping__: async () => {
        return { status: 200 };
      }
    }

    this.registerMethod("__ping__", handler);
  }
}
