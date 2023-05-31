import { promisify } from "util";
import { Transport } from "../../../interfaces/rpc";
import net from "net";
export class TcpTransport implements Transport {
  port: number;
  public handler: Function;

  private server: net.Server;
  constructor(port: number) {
    this.handler = () => {};
    this.port = port;
    this.server = net.createServer().on("connection", (socket) => {
      if (!this.handler) throw "not registared handlers";
      socket.on("data", (request) => {
        socket.emit(this.handler(request));
      });
    });
  }
  delete(): void {
    if (this.server.listening)
      this.server.close(() => {
        console.log("tcp server closed");
      });
  }

  showDown() {
    if (this.server.listening)
      this.server.close(() => {
        console.log("tcp server closed");
      });
  }
  onData(handler: Function) {
    this.handler = handler;
  }

  public async start(): Promise<void> {
    const promisifiedListen = promisify(this.server.listen).bind(this.server);
    await promisifiedListen(this.port);
  }
}
