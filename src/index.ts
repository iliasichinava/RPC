import { JSONRPCHandler } from "src/interfaces/rpc.js";
import { TcpTransport } from "./classes/server/transports/tcp.transport";
import { RPCServer } from "./classes/server";
import { TcpTransportClient } from "./classes/client/transports/tcp.transport";
import { RPCClient } from "./classes/client";

const greet: JSONRPCHandler = {
  greet: async () => {
    return "Handler ended";
  },
};
const bye: JSONRPCHandler = {
  bye: async () => {
    return "Handler ended";
  },
};

const mult: JSONRPCHandler = {
  mult: async (a, b) => {
    return a * b;
  },
};

async function createServer(): Promise<RPCServer> {
  const tcpServer = new TcpTransport(3000);

  const rcpServer = new RPCServer(tcpServer);
  rcpServer.expose("mult", mult);
  rcpServer.expose("greet", greet);
  rcpServer.expose("bye", bye);

  return rcpServer;
}

async function createClient(): Promise<RPCClient> {
  const tcpClient = new TcpTransportClient(3000);

  const rcpServerClient = new RPCClient(tcpClient);

  return rcpServerClient;
}

async function main() {
  const rcpServer = await createServer();

  await rcpServer.run();

  const rpcClient = await createClient();

  await rpcClient.start();

  await rpcClient.call("bye");
  await rpcClient.call("mult", [5, 3]);
  await rpcClient.call("greet");
}

main();
