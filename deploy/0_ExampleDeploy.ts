import 'dotenv/config';

import { ethers } from 'hardhat';
// import { ExampleContract } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('ExampleContract', {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ['ExampleContract'];
