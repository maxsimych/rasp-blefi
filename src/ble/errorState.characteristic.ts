import utils from 'util';
import bleno from '@abandonware/bleno';
import Network, { IMPROV_STATUS, ImprovStatus } from '../network';
import { logger } from '../utils/logger';

function ErrorStateCharacteristic(network: Network) {
  this.network = network;
  this._updateValueCb = null;

  bleno.Characteristic.call(this, {
    uuid: '00467768-6228-2272-4663-277478268002',
    properties: ['read', 'notify'],
    descriptors: [],
    onReadRequest: (_offset: number, cb: Function) => {
      logger.info('[ErrorStateCharacteristic] Read request');
      cb(this.RESULT_SUCCESS, Buffer.from([0x00]));
    },
    onSubscribe: (_maxValueSize: number, updateValueCb: Function) => {
      logger.info('[ErrorStateCharacteristic] Subscribe request');
      this._updateValueCb = updateValueCb;
      setInterval(() => {
        this._updateValueCb(Buffer.from([0x00]));
      }, 1000);
    },
  });
}

utils.inherits(ErrorStateCharacteristic, bleno.Characteristic);

export default ErrorStateCharacteristic;
