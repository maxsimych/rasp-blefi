import bleno from '@abandonware/bleno';
import utils from 'util';
import Network from '../network';
import { logger } from '../utils/logger';
import decrypt from '../utils/decrypt';

const CHUNK_FINAL_PACKAGE = 0x02;
const IMPROV_IDENTITY_COMMAND = 0x02;

const key = process.env.ENCRYPTION_KEY || 'B?E(H+MbQeThWmZq';
let msg = Buffer.from([]);
let msgKey: number | undefined = undefined;

function handleRpcCommand(buffer: Buffer) {
  const firstByte = buffer.readUInt8();
  if (firstByte === IMPROV_IDENTITY_COMMAND) {
    throw new Error('Identity command is not supported');
  } else if (firstByte !== 0x01) {
    throw new Error(`Unknown command ${firstByte}`);
  }
  const checksum = buffer.readUInt8(buffer.length - 1);
  const sum = buffer
    .subarray(0, buffer.length - 1)
    .reduce((sum, cur) => sum + cur, 0);
  const newChecksum = sum & 0xff;
  if (newChecksum !== checksum) {
    throw new Error("Checksum doesn't match");
  }
  const dataLength = buffer.readUInt8(1);
  const data = buffer.subarray(2, dataLength + 2);
  const ssidLength = data.readUInt8();
  const ssid = data.subarray(1, ssidLength + 1);
  const ssidString = ssid.toString('utf8');
  const passwordLength = data.readUInt8(ssidLength + 1);
  const password = data.subarray(
    ssidLength + 2,
    ssidLength + passwordLength + 2
  );
  const passwordString = password.toString('utf8');
  return {
    ssid: ssidString,
    password: passwordString,
  };
}

/**
 * BLE characteristic for Network credential
 * @param network - network
 */
function RpcCommandCharacteristic(network: Network) {
  this.network = network;
  bleno.Characteristic.call(this, {
    uuid: '00467768-6228-2272-4663-277478268003',
    properties: ['write'],
    descriptors: [],
    onWriteRequest: (
      data: Buffer,
      offset: number,
      _withoutResponse: any,
      cb: Function
    ) => {
      logger.info('bluetooth read network credential characteristic');
      if (offset) {
        cb(this.RESULT_ATTR_NOT_LONG);
      } else if (data.length > 32 || data.length <= 0) {
        cb(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
      } else {
        const newMsgKey = data.readUInt8();
        if (msgKey) {
          if (msgKey !== newMsgKey) {
            msgKey = newMsgKey;
            msg = Buffer.from([]);
          }
        } else {
          msgKey = newMsgKey;
        }
        msg = Buffer.concat([msg, data.subarray(2)]);
        if (data.readUInt8(1) === CHUNK_FINAL_PACKAGE) {
          // Parse credentials
          try {
            const credentials = decrypt(msg, key);
            // const credentials = data.toString('utf-8');
            const { ssid, password: pwd } = handleRpcCommand(credentials);

            // Input vaidations
            if (!ssid) {
              logger.error('network ssid is empty', { ssid });
              cb(this.RESULT_UNLIKELY_ERROR);
              return;
            }

            // Configue network
            (this.network as Network)
              .configureNetwork(ssid, pwd)
              .then(() => {
                logger.info('network successfully configured');
                cb(this.RESULT_SUCCESS);
              })
              .catch((err: unknown) => {
                logger.error('unable to configure network', { err });
                cb(this.RESULT_UNLIKELY_ERROR);
              });
          } catch (e) {
            logger.error(e);
            cb(this.RESULT_UNLIKE_ERROR);
          }
        } else {
          cb(this.RESULT_SUCCESS);
        }
      }
    },
  });
}

utils.inherits(RpcCommandCharacteristic, bleno.Characteristic);

export default RpcCommandCharacteristic;
