import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Ballot, Ballot__factory } from "../typechain-types";

//const PROPOSALS = ["Choco", "Vanilla", "Citrus"];

async function main() {
  const args = process.argv;
  const proposals = args.slice(2);
  console.log({ args });
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposals N. ${index + 1}: ${element}`);
  });

  let BallotContract: Ballot;
  let accounts: SignerWithAddress[];
  accounts = await ethers.getSigners();
  const BallotContractFactory = new Ballot__factory(accounts[0]);
  BallotContract = await BallotContractFactory.deploy(
    proposals.map((propo) => ethers.utils.formatBytes32String(propo))
  );
  await BallotContract.deployed();
  console.log(
    `The contract was deployed at thhe address ${BallotContract.address}`
  );
  const chairPerson = await BallotContract.chairman();
  console.log(`The person for this ballot is ${chairPerson}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
