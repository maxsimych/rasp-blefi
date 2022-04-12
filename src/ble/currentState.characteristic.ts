import utils from 'util';
import bleno, { Characteristic } from '@abandonware/bleno';
import Network, { NetworkStatus } from '../network';
import { logger } from '../utils/logger';

function CurrentStateCharacteristic(network: Network) {
  this.network = network;
  this._updateValueCb = null;

  bleno.Characteristic.call(this, {
    uuid: '00467768-6228-2272-4663-277478268001',
    properties: ['read', 'notify'],
    descriptors: [],
    onReadRequest: (_offset: number, cb: Function) => {
      logger.info('bluetooth on read request network status characteristic');
      (this.network as Network)
        .getStatus()
        .then(status => cb(this.RESULT_SUCCESS, Buffer.from([status])))
        .catch((err: unknown) => {
          logger.error('unable to get network status', { err });
          cb(this.RESULT_UNLIKELY_ERROR);
        });
    },
    onSubscribe: (_maxValueSize: number, updateValueCb: Function) => {
      logger.info('bluetooth on subscribe network status characteristic');
      this._updateValueCb = updateValueCb;

      // listen for status change
      this.network.on('statusChange', (status: NetworkStatus) => {
        this._updateValueCb(Buffer.from([status]));
      });
    },
  });
}

utils.inherits(CurrentStateCharacteristic, Characteristic);

export default CurrentStateCharacteristic;
