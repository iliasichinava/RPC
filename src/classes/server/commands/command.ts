import { JSONRPCHandler } from "src/interfaces/rpc.js";

export interface Command {
  execute(): Promise<any>;
}

export class JSONRPCCommand implements Command {
  private receiver: JSONRPCHandler;
  private methodName: string;
  private params: any[];

  constructor(receiver: JSONRPCHandler, methodName: string, params: any[]) {
    this.receiver = receiver;
    this.methodName = methodName;
    this.params = params;
  }

  async execute(): Promise<any> {
    return this.receiver[this.methodName](...this.params);
  }
}
