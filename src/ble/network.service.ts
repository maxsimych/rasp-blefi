import bleno, { PrimaryService } from '@abandonware/bleno';
import utils from 'util';
import Network from '../network';
import CapabilitiesCharacteristic from './capabilities.characteristic';
import CurrentStateCharacteristic from './currentState.characteristic';
import RpcCommandCharacteristic from 'ble/rpcCommand.characteristic';

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
      new RpcCommandCharacteristic(network),
      // @ts-ignore
      // new NetworkStatusCharacteristic(network),
      // @ts-ignore
      // new NetworkCredentialCharacteristic(network),
      // @ts-ignore
      // new NetworkSsidCharacteristic(network),
    ],
  });
}

utils.inherits(NetworkService, PrimaryService);

export default NetworkService;
