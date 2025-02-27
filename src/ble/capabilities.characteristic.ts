import utils from 'util';
import bleno from '@abandonware/bleno';
import Network from '../network';

function CapabilitiesCharacteristic(network: Network) {
  this.network = network;
  bleno.Characteristic.call(this, {
    uuid: '00467768-6228-2272-4663-277478268005',
    properties: ['read'],
    descriptors: [],
    value: Buffer.from([0x00]),
  });
}

utils.inherits(CapabilitiesCharacteristic, bleno.Characteristic);

export default CapabilitiesCharacteristic;
