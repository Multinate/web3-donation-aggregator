import 'dotenv/config';

import { ethers } from 'hardhat';
import { AttestationStation } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('MockUSDC', {
    from: deployer,
    log: true,
    args: [],
  });

  await deploy('MockERC20', {
    from: deployer,
    log: true,
    args: [],
  });

  await deploy('MockWETH', {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ['Mock'];
