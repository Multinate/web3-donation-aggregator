import 'dotenv/config';

import { ethers } from 'hardhat';
import { AttestationStation } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('AttestationStation', {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ['AttestationStation'];
