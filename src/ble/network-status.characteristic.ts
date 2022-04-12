import bleno, { Characteristic } from '@abandonware/bleno';
import utils from 'util';
import Network, { NetworkStatus } from '../network';
import { logger } from '../utils/logger';

/**
 * BLE characteristic for Network connection status
 * @summary Hold the current connection status of the network
 * @param network - network
 */
function NetworkStatusCharacteristic(network: Network) {
  this.network = network;
  this._updateValueCb = null;

  bleno.Characteristic.call(this, {
    uuid: 'fff1',
    properties: ['read', 'notify'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: '',
      }),
    ],
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

utils.inherits(NetworkStatusCharacteristic, Characteristic);

export default NetworkStatusCharacteristic;
