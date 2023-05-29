import { EventEmitter } from 'events';
import { Mode, Transport } from '../../interfaces/rpc';

export class TransportServer implements Transport {
  private emitter: EventEmitter;
  private inTopic: string;
  private outTopic: string;

  constructor({ emitter, inTopic, outTopic }: { emitter: EventEmitter, inTopic: string, outTopic: string }) {
    this.emitter = emitter;
    this.inTopic = inTopic;
    this.outTopic = outTopic;
  }

  public onData(callback: (data: string) => any): void {
    this.emitter.on(this.inTopic, async (reqData: string) => {
      const respData = await callback(reqData);
      if (!respData || JSON.parse(reqData).mode == Mode.Notify) return;
      
      this.emitter.emit(this.outTopic, respData);
    });
  }

  public send(data: string): Promise<void> {
    return new Promise((_res, _rej) => {
      this.emitter.emit(this.outTopic, data);
    })
  }

  public delete() {
    this.emitter.removeAllListeners();
  }

}