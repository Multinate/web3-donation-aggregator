import 'dotenv/config';

import { ethers } from 'hardhat';
import { AttestationStation, MockUSDC } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed attestation contract
  const attestation: AttestationStation = await deployments.get('AttestationStation');
  // let attestation = '0xEE36eaaD94d1Cc1d0eccaDb55C38bFfB6Be06C77';
  // Get the deployed USDC contract
  const usdc: MockUSDC = await deployments.get('MockUSDC');

  // Set minimum score for attestation
  const minScore = 50;

  // Gnosis safe address
  const gnosisSafe = '0x9c9EaE71CBc35cfd2457B8C0fdbd167e8229fa3E';

  // Deploy Multinate contract
  const multinate = await deploy('Multinate', {
    from: deployer,
    args: [attestation.address, minScore, gnosisSafe, usdc.address],
    log: true,
  });
};

module.exports.tags = ['Multinate'];
