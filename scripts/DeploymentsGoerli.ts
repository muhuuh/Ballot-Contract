import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

//contract deployed at 0xFC08457Dd5185af2c1068de0993770AcB1Adb857

async function main() {
  const provider = ethers.getDefaultProvider("goerli");
  //const lastBlock = await provider.getBlock("latest");
  //console.log({ lastBlock });
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();

  const args = process.argv;
  const proposals = args.slice(2);
  console.log({ args });
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposals N. ${index + 1}: ${element}`);
  });

  let BallotContract: Ballot;
  //let BallotContract: EnhancedBallot;
  //const BallotContractFactory = await ethers.getContractFactory("Ballot");
  const BallotContractFactory = new Ballot__factory(signer);
  //const BallotContractFactory = new EnhancedBallot__factory(signer);
  BallotContract = await BallotContractFactory.deploy(
    proposals.map((propo) => ethers.utils.formatBytes32String(propo))
  );
  await BallotContract.deployed();
  console.log(
    `The contract was deployed at thhe address ${BallotContract.address}`
  );
  const chairman = await BallotContract.chairman();
  console.log(`The person for this ballot is ${chairman}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
