import 'dotenv/config';

import { ethers } from 'hardhat';
import { AttestationStation } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('PancakeFactory', {
    from: deployer,
    log: true,
    args: [deployer],
  });
};

module.exports.tags = ['Factory'];
