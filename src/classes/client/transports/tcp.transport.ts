import { promisify } from "util";
import { JSONRPCRequest, JSONRPCResponse } from "src/interfaces/rpc.js";

import { ClientTransport } from "src/interfaces/client";
import net from "net";

export class TcpTransportClient implements ClientTransport {
  public clientServer: net.Socket;
  private port: number;
  public responseHander: Function;

  constructor(port: number) {
    this.responseHander = () => {};

    this.port = port;
    this.clientServer = new net.Socket();

    this.clientServer.on("data", (data) => {
      this.responseHander(data);
    });
  }
  async send(request: JSONRPCRequest): Promise<boolean> {
    console.log(JSON.stringify(request), "[sending it from client]");
    return this.clientServer.write(JSON.stringify(request));
  }

  public setResponseHander(handler: Function) {
    this.responseHander = handler;
  }

  delete() {
    this.clientServer.end(() => {
      console.log("client server ended");
    });
  }

  async start(): Promise<void> {
    const promisifiedListen = promisify(this.clientServer.connect).bind(
      this.clientServer
    );
    await promisifiedListen(this.port);
  }
}
