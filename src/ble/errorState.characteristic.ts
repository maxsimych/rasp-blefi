import utils from 'util';
import bleno, { Characteristic } from '@abandonware/bleno';
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
      // logger.info('bluetooth on read request network status characteristic');
      // (this.network as Network)
      //   .getStatus()
      //   .then(status => cb(this.RESULT_SUCCESS, Buffer.from([status])))
      //   .catch((err: unknown) => {
      //     logger.error('unable to get network status', { err });
      //     cb(this.RESULT_UNLIKELY_ERROR);
      //   });
    },
    onSubscribe: (_maxValueSize: number, updateValueCb: Function) => {
      logger.info('[ErrorStateCharacteristic] Subscribe request');
      this._updateValueCb = updateValueCb;
      setInterval(() => {
        this._updateValueCb(Buffer.from([0x00]));
      }, 1000);

      // listen for status change
      // this.network.on('statusChange', (status: ImprovStatus) => {
      //   this._updateValueCb(Buffer.from([status]));
      // });
    },
  });
}

utils.inherits(ErrorStateCharacteristic, Characteristic);

export default ErrorStateCharacteristic;
