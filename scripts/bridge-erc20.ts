import { MockUSDC } from '../typechain';
import { abi } from '../abi/HypERC20Collateral.json';
import { ethers } from 'hardhat';
function addressToBytes32(address: any) {
  // Remove the '0x' prefix from the address
  const unprefixedAddress = ethers.utils.getAddress(address).slice(2);

  // Pad the address with zeros to create a bytes32 value
  const paddedAddress = '0x' + unprefixedAddress.padStart(64, '0');

  // Convert the padded address to a bytes32 array
  const bytes32Address = ethers.utils.arrayify(paddedAddress);

  return bytes32Address;
}

async function main() {
  // Get signer
  const signers = await ethers.getSigners();

  // Get contracts
  const usdc: MockUSDC = await ethers.getContract('MockUSDC', signers[0]);
  const hypUsdcOpColl = '0xB4427A44AB33972c8E5E21D5F4B00637099cCba8';
  const hypUsdcGoerli = '0xF6455dbBd6f60F069b71e8d1c28c5971978e733f';
  const hypUsdcMumbai = '0xB7FC58dA365D6E328362B5799ec8E9a7Ae13cA07';
  const mumbaiChainId = 534353;
  console.log('Running script');
  // Get contract at address hypUsdcOpColl with abi HypERC20Collateral.json
  const hypUsdc = new ethers.Contract(hypUsdcOpColl, abi, signers[0]);
  let tx = await hypUsdc.transferRemote(
    mumbaiChainId,
    addressToBytes32(signers[0].address),
    ethers.utils.parseEther('100'),
    { value: ethers.utils.parseEther('0.01') }
  );
  await tx.wait();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
