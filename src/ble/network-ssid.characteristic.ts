import bleno from '@abandonware/bleno';
import utils from 'util';
import Network from '../network';
import { logger } from '../utils/logger';

/**
 * BLE characteristic for Network SSID
 * @summary Hold the current SSID of the WIFI network connected
 * @param network - network
 */
function NetworkSsidCharacteristic(network: Network) {
  this.network = network;
  bleno.Characteristic.call(this, {
    uuid: 'fff3',
    properties: ['read'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: '',
      }),
    ],
    onReadRequest: (_offset: number, cb: Function) => {
      logger.info('bluetooth read network SSID characateristic');
      (this.network as Network)
        .getConnectedSSID()
        .then(ssid => cb(this.RESULT_SUCCESS, Buffer.from(ssid)))
        .catch((err: unknown) => {
          logger.error('unable to get connected SSID', { err });
          cb(this.RESULT_UNLIKELY_ERROR);
        });
    },
  });
}

utils.inherits(NetworkSsidCharacteristic, bleno.Characteristic);

export default NetworkSsidCharacteristic;
