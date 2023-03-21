import 'dotenv/config';

import { ethers } from 'hardhat';
import { AttestationStation } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed attestation contract
  const attestation: AttestationStation = await deployments.get('AttestationStation');

  // Set minimum score for attestation
  const minScore = 50;
  // Deploy Multinate contract
  const multinate = await deploy('Multinate', {
    from: deployer,
    args: [attestation.address, minScore],
    log: true,
  });
};

module.exports.tags = ['Multinate'];
