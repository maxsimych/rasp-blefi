import {
  findNetworkBySSID,
  addNetwork,
  setNetworkVariable,
  enableNetwork,
  removeNetwork,
  getConnectedSSID as getCurrentSSID,
  saveConfig,
  listNetworks,
} from './utils/cmd';
import { EventEmitter } from 'events';
import { logger } from './utils/logger';

export enum NetworkStatus {
  connected = 'connected',
  disconnected = 'disconnected',
}

/**
 * Represent network
 */
export default class Network extends EventEmitter {
  /**
   * Wifi network interface name
   */
  private ifName: string;

  private ssid: string = '';

  // @ts-ignore
  private status: NetworkStatus;

  constructor(ifName: string) {
    super();
    this.ifName = ifName;

    // Watch for status changing
    const id = setInterval(() => {
      logger.debug('watch for status change');
      const hasChange = this.hasStatusChanged(this.status);
      if (hasChange) {
        this.emit('statusChange', this.status, this.ssid);
        if (this.status === 'connected') {
          setTimeout(() => {
            clearInterval(id);
            this.emit('connected');
          }, 3000);
        }
      }
    }, 1000);
  }

  /**
   * Get current connected SSID
   */
  async getConnectedSSID(): Promise<string> {
    this.ssid = await getCurrentSSID(this.ifName);
    return this.ssid;
  }

  /**
   * Get current network connection status
   */
  async getStatus(): Promise<NetworkStatus> {
    logger.info('get WIFI network connection status');
    const ssid = await this.getConnectedSSID();
    return ssid ? NetworkStatus.connected : NetworkStatus.disconnected;
  }

  /**
   * Compare old status with new status
   * @param oldStatus - old status
   */
  async hasStatusChanged(oldStatus: NetworkStatus): Promise<boolean> {
    logger.info('check if network connection status has changed');
    const newStatus = await this.getStatus();
    const hasChanged = newStatus !== oldStatus;
    if (hasChanged) {
      logger.info(
        `status has changed, old status "${oldStatus}", newStatus "${newStatus}"`
      );
      this.status = newStatus;
    }
    return hasChanged;
  }

  /**
   * Configure WIFI network
   * @param ssid - ssid
   * @param pwd - password
   */
  async configureNetwork(ssid: string, pwd: string) {
    logger.info('configure WIFI network', { ssid });
    let networkId: number;
    try {
      const allNetworks = await listNetworks(this.ifName);
      for (const item of allNetworks) {
        await removeNetwork(this.ifName, item.networkId);
      }
      // const network = await findNetworkBySSID(this.ifName, ssid);

      // Create or Update network
      // if (network.networkId) {
      //   networkId = network.networkId;
      // } else {
      networkId = await addNetwork(this.ifName);
      // }

      // Set credentials
      await setNetworkVariable(this.ifName, networkId, 'ssid', `'"${ssid}"'`);
      if (pwd) {
        await setNetworkVariable(this.ifName, networkId, 'psk', `'"${pwd}"'`);
      } else {
        await setNetworkVariable(this.ifName, networkId, 'key_mgmt', 'NONE');
      }

      await enableNetwork(this.ifName, networkId);
      // await saveConfig(ssid, pwd);
    } catch (err) {
      // @ts-ignore
      if (networkId) {
        await removeNetwork(this.ifName, networkId);
      }
    }
  }
}
