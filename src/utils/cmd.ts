import { exec } from 'child_process';
import { logger } from '../utils/logger';

export interface WpaNetwork {
  networkId: number;
  ssid: string;
  bssid: string;
  flags: string;
}

export function executeCmd(...args: (string | number)[]): Promise<string> {
  const cmd = args.join(' ');
  logger.info('execute shell command', { cmd });
  return new Promise((res, rej) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error('shell command execution failed', { error });
        rej(error);
        return;
      }
      if (stderr) {
        logger.error('shell command execution error', { stderr });
        rej(error);
        return;
      }
      res(stdout.trim());
    });
  });
}

export function executeWpa(
  ifname: string,
  ...args: (string | number)[]
): Promise<string> {
  logger.info('execute wpa_cli command', { ifname, args });
  return executeCmd(...['wpa_cli', '-i', ifname, ...args]);
}

export async function listNetworks(ifname: string): Promise<WpaNetwork[]> {
  logger.info('execute wpa_cli list networks', { ifname });
  const networksRaw: string = await executeWpa(ifname, 'list_networks');
  const networkLines = networksRaw.split('\n');

  return networkLines.map(line => {
    const fields = line.split('\t');
    const network: WpaNetwork = {
      networkId: parseInt(fields[0], 10),
      ssid: fields[1],
      bssid: fields[2],
      flags: fields[3],
    };
    return network;
  });
}

export async function findNetworkBySSID(
  ifname: string,
  ssid: string
): Promise<WpaNetwork> {
  logger.info('find wpa_cli network by SSID', { ifname, ssid });
  const networks = await listNetworks(ifname);
  // @ts-ignore
  let network = networks.find(n => n.ssid === ssid);
  if (!network) {
    network = {
      networkId: 0,
      ssid: '',
      bssid: '',
      flags: '',
    };
  }
  return network;
}

export async function setNetworkVariable(
  ifname: string,
  networkId: number,
  name: string,
  value: string
) {
  logger.info('set wpa_cli network variable', { networkId, name });
  await executeWpa(ifname, 'set_network', networkId, name, value);
}

export async function addNetwork(ifname: string): Promise<number> {
  logger.info('create new wpa_cli network', { ifname });
  const result = await executeWpa(ifname, 'add_network');
  return parseInt(result, 10);
}

export async function removeNetwork(ifname: string, networkId: number) {
  logger.info('remove wpa_cli network', { ifname });
  return await executeWpa(ifname, 'remove_network', networkId);
}

export async function enableNetwork(ifname: string, networkId: number) {
  logger.info('enable wpa_cli network', { ifname, networkId });
  return await executeWpa(ifname, 'enable_network', networkId);
}

export async function getConnectedSSID(ifname: string): Promise<string> {
  logger.info('get connected wifi network SSID', { ifname });
  return await executeCmd(...['iwgetid', '-r', ifname]);
}
