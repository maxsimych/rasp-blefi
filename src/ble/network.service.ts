import bleno, { PrimaryService } from '@abandonware/bleno';
import utils from 'util';
import Network from '../network';
import NetworkStatusCharacteristic from './network-status.characteristic';
import NetworkCredentialCharacteristic from './network-credential.characteristic';
import NetworkSsidCharacteristic from './network-ssid.characteristic';
import CapabilitiesCharacteristic from './capabilities.characteristic';
import CurrentStateCharacteristic from 'ble/currentState.characteristic';

/**
 * BLE service for Network
 * @param network - network
 */
function NetworkService(network: Network) {
  bleno.PrimaryService.call(this, {
    // UUID in accordance with https://www.improv-wifi.com/ble/
    uuid: '00467768-6228-2272-4663-277478268000',
    characteristics: [
      // @ts-ignore
      new CurrentStateCharacteristic(network),
      // @ts-ignore
      new CapabilitiesCharacteristic(network),
      // @ts-ignore
      new NetworkStatusCharacteristic(network),
      // @ts-ignore
      new NetworkCredentialCharacteristic(network),
      // @ts-ignore
      new NetworkSsidCharacteristic(network),
    ],
  });
}

utils.inherits(NetworkService, PrimaryService);

export default NetworkService;
