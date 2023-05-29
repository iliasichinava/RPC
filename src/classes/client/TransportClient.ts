import { EventEmitter } from 'events';
import { Transport } from '../../interfaces/rpc';

export class TransportClient implements Transport {
  private emitter: EventEmitter;
  private inTopic: string;
  private outTopic: string;

  constructor({ emitter, inTopic, outTopic }: { emitter: EventEmitter, inTopic: string, outTopic: string }) {
    this.emitter = emitter;
    this.inTopic = inTopic;
    this.outTopic = outTopic;
  }

  public onData(callback: (data: string) => void): void {
    this.emitter.on(this.inTopic, callback);
  }

  async send(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.emitter.emit(this.outTopic, data);
      resolve();
    });
  }

  public delete() {
    this.emitter.removeAllListeners();
  }
}
  