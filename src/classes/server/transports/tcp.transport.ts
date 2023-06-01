import { JSONRPCRequest, Mode } from "src/interfaces/rpc.js";
import { promisify } from "util";
import { JSONRPCResponse, ServerTransport } from "../../../interfaces/rpc";
import net from "net";
export class TcpTransport implements ServerTransport {
  port: number;
  public handler: Function;

  private server: net.Server;
  constructor(port: number) {
    this.handler = () => {};
    this.port = port;
    this.server = net.createServer().on("connection", (socket) => {
      if (!this.handler) throw "not registared handlers";
      console.log("connect");
      let buffer: string = "";

      socket.on("data", async (data) => {
        buffer += data.toString();

        // Process complete JSON objects
        while (buffer.includes("}")) {
          const endIndex = buffer.indexOf("}") + 1;
          const jsonString = buffer.substring(0, endIndex);
          buffer = buffer.substring(endIndex);

          try {
            const data: JSONRPCResponse = await this.handler(jsonString);
            const checkToReturnResponse: JSONRPCRequest =
              JSON.parse(jsonString);

            if (checkToReturnResponse.mode == Mode.Notify) {
              return;
            }

            socket.write(data.toString());
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      });

      socket.on("end", () => {
        console.log("sending");
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
