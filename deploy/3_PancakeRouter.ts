import 'dotenv/config';

import { ethers } from 'hardhat';
import { PancakeFactory, MockWETH } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  // Get pancakefactory contract
  const pancakeFactory: PancakeFactory = await deployments.get('PancakeFactory');
  // Get mockWETH contract
  const mockWETH: MockWETH = await deployments.get('MockWETH');
  await deploy('PancakeRouter', {
    from: deployer,
    log: true,
    args: [pancakeFactory.address, mockWETH.address],
  });
};

module.exports.tags = ['Router'];
