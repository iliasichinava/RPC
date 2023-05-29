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

  /* Create and Run some test handlers */

  const handler: JSONRPCHandler = {
    greet: async () => {
      console.log("-------------------------------------");
      console.log("Hello");
      return "Handler ended";
    },

    bye: async () => {
      console.log("-------------------------------------");
      console.log("Bye");
      return "Handler ended"
    }
  }
  
  server.registerMethod("greet", handler);
  server.registerMethod("bye", handler);

  let tr1 = new TransportServer({ emitter, inTopic: 'fromClient2', outTopic: 'toClient2' });
  server.addTransport(tr1); // add a transport manually

  server.run(); // Start server
  
  /* Test 1 */
  let connected = await clients.client2.ping();
  if (connected) {
    const response1 = await clients.client2.call("greet");
    console.log("First: " + response1);
  } else {
    console.log("Not connected");
  }

  const response2 = await clients.client2.call("bye");
  console.log(response2);
}

async function prepareServer(emitter: EventEmitter) {
  const server = new RPCServer(
    [
      new TransportServer({
        emitter,
        inTopic: 'fromClient1',
        outTopic: 'toClient1',
      })
    ]
  );

  return server;
}

async function prepareClients(emitter: EventEmitter) {
  const tc1 = new TransportClient({
    emitter,
    inTopic: 'toClient1',
    outTopic: 'fromClient1',
  });

  const tc2 = new TransportClient({
    emitter,
    inTopic: 'toClient2',
    outTopic: 'fromClient2',
  });

  const client1 = new RPCClient(tc1);
  const client2 = new RPCClient(tc2);  

  client2.delete(tc2);

  return { client1, client2 };
}

main()
  .then((res: any) => {
    if (res) console.log(res);
    else console.log("Finished");
  })
  .catch(console.error);
