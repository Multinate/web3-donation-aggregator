import { AttestationStation, Multinate } from '../typechain';

import { ethers } from 'hardhat';

async function main() {
  // Get signer
  const signers = await ethers.getSigners();
  let other = signers[1];
  let attestationAddr = '0xEE36eaaD94d1Cc1d0eccaDb55C38bFfB6Be06C77';
  let charityAddr = signers[0].address;
  // Get contracts
  // const attestationStation: AttestationStation = await ethers.getContractAt(
  //   'AttestationStation',
  //   attestationAddr,
  //   signers[0]
  // );
  const attestationStation: AttestationStation = await ethers.getContract('AttestationStation', signers[0]);
  const multinate: Multinate = await ethers.getContract('Multinate', signers[0]);

  let REGISTRATION_KEY = await multinate.REGISTRATION_KEY();
  let TAX_EXEMPT_STATUS_KEY = await multinate.TAX_EXEMPT_STATUS_KEY();
  let FINANCIAL_STATEMENTS_KEY = await multinate.FINANCIAL_STATEMENTS_KEY();
  let MISSION_STATEMENT_KEY = await multinate.MISSION_STATEMENT_KEY();
  // await attestationStation.connect(signers[0])['attest(address,bytes32,bytes)'](charityAddr, REGISTRATION_KEY, '0x01');
  // await attestationStation
  //   .connect(signers[0])
  //   ['attest(address,bytes32,bytes)'](charityAddr, TAX_EXEMPT_STATUS_KEY, '0x01');
  // await attestationStation
  //   .connect(signers[0])
  //   ['attest(address,bytes32,bytes)'](charityAddr, FINANCIAL_STATEMENTS_KEY, '0x40');
  // await attestationStation
  //   .connect(signers[0])
  //   ['attest(address,bytes32,bytes)'](charityAddr, MISSION_STATEMENT_KEY, '0x50');

  // const tx = await multinate.connect(signers[0]).updateCharityScore(charityAddr);
  // await tx.wait();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
