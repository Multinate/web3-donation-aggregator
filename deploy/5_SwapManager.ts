import 'dotenv/config';

import { ethers } from 'hardhat';
import { MockUSDC, Multinate, PancakeRouter } from '../typechain';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  // Get the deployed multinate contract
  const multinate: Multinate = await deployments.get('Multinate');
  const uniswapRouter: PancakeRouter = await deployments.get('PancakeRouter');
  // Get the deployed USDC contract
  const usdc: MockUSDC = await deployments.get('MockUSDC');
  let hypUsdcAddr = '0xB7FC58dA365D6E328362B5799ec8E9a7Ae13cA07';
  let uniswapRouterAddr = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
  // If chainId is mumbai, use these addresses
  if (chainId == 80001) {
    hypUsdcAddr = '0xB7FC58dA365D6E328362B5799ec8E9a7Ae13cA07';
    uniswapRouterAddr = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
  }
  // If chainId is goerli, use these addresses
  else if (chainId == 5) {
  }
  // If chainId is optimism testnet, use these addresses
  else if (chainId == 420) {
  }
  // If chainId is scroll testnet, use these addresses
  else if (chainId == 534353) {
  } else {
  }
  // Deploy SwapManager contract
  const swapManager = await deploy('SwapManager', {
    from: deployer,
    args: [
      usdc.address,
      '0x77f359C9e1F5a1264B931fca77523d99a7807b50',
      uniswapRouter.address,
      multinate.address,
      chainId,
    ],
    log: true,
  });
};

module.exports.tags = ['SwapManager'];
