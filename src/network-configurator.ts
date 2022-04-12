import { EventEmitter } from 'events';
import bleno from '@abandonware/bleno';
import NetworkService from './ble/network.service';
import Network, {
  IMPROV_STATUS,
  ImprovStatus,
  ImprovStatusKeys,
} from './network';
import { logger } from './utils/logger';

/**
 * Status change event
 */
enum StatusChangeEvent {
  POWERED_ON = 'poweredOn',
  POWERED_OFF = 'poweredOff',
}

/**
 * Network configurator configuration
 */
export interface NetworkConfiguratorConfig {
  /**
   * User defined custom services
   */
  customServices?: any[];
  /**
   * WIFI Network interface name
   */
  ifName: string;
  /**
   * BLE device name
   */
  deviceName: string;
}

/**
 * Main network configuration class
 */
export class NetworkConfigurator extends EventEmitter {
  /**
   * BLE services
   */
  private readonly services: any[];
  /**
   * BLE device name
   */
  private readonly deviceName: string;
  /**
   * Network configuration
   */
  private readonly network: Network;

  /**
   * Construct instance
   * @constructor
   * @param config - network configuration
   */
  constructor(config: NetworkConfiguratorConfig) {
    super();
    this.deviceName = config.deviceName;
    this.network = new Network(config.ifName);

    logger.info('configure network configurator', {
      deviceName: config.deviceName,
      ifName: config.ifName,
    });

    // Build services
    const customServices = config.customServices ?? [];
    // @ts-ignore
    const networkService = new NetworkService(this.network);
    this.services = [networkService, ...customServices];

    // Bleno events
    bleno.on('stateChange', this.stateChange.bind(this));
    bleno.on('advertisingStart', this.advertisingStart.bind(this));

    // Bubble up status change
    this.network.on('statusChange', (status, ssid) =>
      this.emit('statusChange', status, ssid)
    );

    // Bubble up status change
    this.network.on('connected', (status, ssid) => {
      const statusName = NetworkConfigurator.getStatusName(status);
      this.emit('connected', statusName, ssid);
    });
  }

  private static getStatusName(status: ImprovStatus) {
    return Object.keys(IMPROV_STATUS).find(
      key => IMPROV_STATUS[key as ImprovStatusKeys] === status
    );
  }

  /**
   * State change event handler
   * @param event - status change event
   */
  private stateChange(event: StatusChangeEvent) {
    logger.info('bluetooth services state change', { event });
    switch (event) {
      // Powered on
      case StatusChangeEvent.POWERED_ON:
        const serviceUuids = this.services.map(s => s.uuid);
        bleno.startAdvertising(this.deviceName, serviceUuids, () => {
          logger.info('bluetooth services advertising started');
        });
        break;
      // Powered off
      case StatusChangeEvent.POWERED_OFF:
        bleno.stopAdvertising(() =>
          logger.warn('bluetooth services advertising stopped')
        );
        break;
      default:
        logger.debug('bluetooth services triggered unhandled event', { event });
    }
  }

  /**
   * Adverstising start event handler
   * @param error - error
   */
  private advertisingStart(error: unknown) {
    logger.debug('advertising start callback called');
    if (error) {
      logger.error('bluetooth advertising starting failed', error);
    } else {
      bleno.setServices(this.services, (error: unknown) => {
        if (error) {
          logger.error('bluetooth services registration failed', error);
        } else {
          logger.info('bluetooth services registered');
        }
      });
    }
  }
}
