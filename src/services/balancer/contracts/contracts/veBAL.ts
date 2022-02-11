import Service from '../balancer-contracts.service';
import { Multicaller } from '@/lib/utils/balancer/contract';

import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import veBalAbi from '@/lib/abi/veBalAbi.json';
import { bnum } from '@/lib/utils';

export type VeBalLockInfo = {
  lockedUntil: string;
  lockedAmount: string;
  totalSupply: string;
  epoch: string;
  hasLock: boolean;
};

type VeBalLockInfoResult = {
  locked: BigNumber[];
  epoch: BigNumber;
  totalSupply: string;
};

export default class VeBAL {
  service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  public async getLockInfo(account: string): Promise<VeBalLockInfo> {
    const veBalMulticaller = new Multicaller(
      this.service.config.key,
      this.service.provider,
      veBalAbi
    );

    veBalMulticaller.call('locked', this.address, 'locked', [account]);
    veBalMulticaller.call('epoch', this.address, 'epoch');
    veBalMulticaller.call('totalSupply', this.address, 'totalSupply()');

    const result = await veBalMulticaller.execute<VeBalLockInfoResult>();

    return this.formatLockInfo(result);
  }

  public formatLockInfo(lockInfo: VeBalLockInfoResult) {
    const [lockedAmount, lockedUntil] = lockInfo.locked.map(amount =>
      formatUnits(amount, 18)
    );

    return {
      lockedUntil,
      lockedAmount,
      totalSupply: formatUnits(lockInfo.totalSupply, 18),
      epoch: formatUnits(lockInfo.epoch, 18),
      hasLock: bnum(lockedAmount).gt(0)
    };
  }

  public get address(): string {
    return this.service.config.addresses.veBAL;
  }
}
