import { EventEmitter } from "events";
import { JSONRPCHandler, Transport } from "./interfaces/rpc";
import { TcpTransport } from "./classes/server/transports/tcp.transport";
import { RPCServer } from "./classes/server";
import { RPCClient } from "./classes/client";

async function main() {
  const tcpServer = new TcpTransport(3000);

  const rcpServer = new RPCServer(tcpServer);

  // const server = await prepareServer();
  // const clients = await prepareClients();

  /* Create and Run some test handlers */

  const greet: JSONRPCHandler = {
    greet: async () => {
      console.log("-------------------------------------");
      console.log("Hello");
      return "Handler ended";
    },
  };
  const bye: JSONRPCHandler = {
    bye: async () => {
      console.log("-------------------------------------");
      console.log("Bye");
      return "Handler ended";
    },
  };
  rcpServer.expose("greet", greet);
  rcpServer.expose("bye", bye);

  await rcpServer.run();

  // server.registerMethod("greet", handler);
  // server.registerMethod("bye", handler);

  // server.run(); // Start server

  /* Test 1 */
  // let connected = await clients.client2.ping();
  // if (connected) {
  //   const response1 = await clients.client2.call("greet");
  //   console.log("First: " + response1);
  // } else {
  //   console.log("Not connected");
  // }

  // const response2 = await clients.client2.call("bye");
  // console.log(response2);
}

async function prepareServer(emitter: EventEmitter) {}

async function prepareClients() {}

main()
  .then((res: any) => {
    if (res) console.log(res);
    else console.log("Finished");
  })
  .catch(console.error);
