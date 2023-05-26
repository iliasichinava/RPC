import { JSONRPCHandler, JSONRPCRequest, JSONRPCResponse } from "src/interfaces/rpc.js";
import { JSONRPCCommand } from "./command";

export class Invoker {
  
  public constructor(private _handlers: Map<string, JSONRPCHandler>) { }

  public register(method: string, handler: JSONRPCHandler) {
    this._handlers.set(method, handler);
  }

  public async invoke(request: JSONRPCRequest): Promise<JSONRPCResponse> {

    /* Check for errors */
    if (request.jsonrpc !== '2.0') throw new Error("Invalid JSON-RPC Version");
    if (!request.method || typeof request.method !== "string") throw new Error("Invalid method");

    const handler = this._handlers.get(request.method);
    if (!handler || typeof handler !== "object") throw new Error("Invalid handler");

    /* Handle commands */
    const command = new JSONRPCCommand(handler, request.method, request.params || []);

    try {
      const result = await command.execute();

      const response: JSONRPCResponse = {
        jsonrpc: "2.0",
        result,
        id: request.id || null
      };

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  public get handlers(): Map<string, JSONRPCHandler> {
    return this._handlers;
  }

}
  