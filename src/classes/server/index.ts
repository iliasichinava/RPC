import { JSONRPCRequest, JSONRPCHandler, Transport } from "../../interfaces/rpc";
import { Invoker } from "./commands";

export class RPCServer {
  
  private invoker: Invoker;
  private transportsQueue: Transport[];

  /* PUBLIC METHODS */

  public constructor(transports: Transport);
  public constructor(transports: Transport[]);
  public constructor(transports: Transport | Transport[]) {
    this.invoker = new Invoker(new Map<string, JSONRPCHandler>());
    this.transportsQueue = Array.isArray(transports) ? transports : [transports];
  }

  public run(): void {
    this.registerPingMethod();

    for (const transport of this.transportsQueue) {
      console.info("Transport registered!");
      this.registerTransport(transport);
    }
  }

  public registerMethod(method: string, handler: JSONRPCHandler): void {
    this.invoker.register(method, handler);
    console.log(`Method ${method} has been registered`);
  }

  /* PRIVATE METHODS */

  private registerTransport(transport: Transport): void {
    transport.onData(async (data: string) => {
      const request: JSONRPCRequest = JSON.parse(data);
      await this.handleRequest(transport, request);
    });
  }

  private async handleRequest(transport: Transport, request: JSONRPCRequest): Promise<void> {
    const response = await this.invoker.invoke(request);
    if(request.method !== "notify") await transport.send(JSON.stringify(response));
  }

  private registerPingMethod() {
    const handler: JSONRPCHandler = {
      __ping__: async () => {

        const response = {
          status: 200,
        }

        return response;
        
      }
    }

    this.registerMethod("__ping__", handler);
  }
}