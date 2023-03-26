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
  const gnosisUsdc = '0x77f359C9e1F5a1264B931fca77523d99a7807b50';
  const chainId = 10;
  console.log('Running script');
  // Get contract at address hypUsdcOpColl with abi HypERC20Collateral.json
  const hypUsdc = new ethers.Contract(gnosisUsdc, abi, signers[0]);
  let tx = await hypUsdc.transferRemote(chainId, addressToBytes32(signers[0].address), ethers.utils.parseEther('100'), {
    value: ethers.utils.parseEther('0.6'),
  });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
