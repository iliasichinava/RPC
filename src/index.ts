import { EventEmitter } from 'events';
import { JSONRPCHandler, Transport } from './interfaces/rpc';
import { RPCServer } from './classes/server';
import { RPCClient } from './classes/client';
import { TransportClient } from './classes/client/TransportClient';
import { TransportServer } from './classes/server/TransportServer';

async function main() {
  const emitter = new EventEmitter();

  const server = await prepareServer(emitter);
  const clients = await prepareClients(emitter);

  const handler: JSONRPCHandler = {
    greet: async () => {
      console.log("-------------------------------------");
      console.log("oee");
      return "hello";
    }
  }
  
  server.registerMethod("greet", handler);

  server.run();

  /* Test 1 */
  let connected = await clients.simpleClient.ping();
  if (connected) {
    const response = await clients.simpleClient.call("greet");
    console.log(response)
  } else {
    console.log("Not connected");
  }

}

async function prepareServer(emitter: EventEmitter) {
  return new RPCServer(
    [
      new TransportServer({
        emitter,
        inTopic: 'fromClient1',
        outTopic: 'toClient1',
      })
      // new TransportServer({
      //   emitter,
      //   inTopic: 'fromClient2',
      //   outTopic: 'toClient2',
      // })
    ]
  );
}

async function prepareClients(emitter: EventEmitter) {
  const transportClient = new TransportClient({
    emitter,
    inTopic: 'toClient1',
    outTopic: 'fromClient1',
  });

  const simpleClient = new RPCClient(transportClient);

  return { simpleClient };
}

main()
  .then((res: any) => {
    if (res) console.log(res);
    else console.log("Finished");
  })
  .catch(console.error);
