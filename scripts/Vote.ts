import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

//const PROPOSALS = ["Choco", "Vanilla", "Citrus"];

async function main() {
  const provider = ethers.getDefaultProvider("goerli");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  const signer = wallet.connect(provider);

  const args = process.argv;
  const params = args.slice(2);
  const contractAddress = params[0];
  const proposalVoted = params[1];

  let BallotContract: Ballot;
  const BallotContractFactory = new Ballot__factory(signer);
  BallotContract = BallotContractFactory.attach(contractAddress);
  const tx = await BallotContract.vote(proposalVoted);
  const txReceipt = tx.wait(1);

  console.log(txReceipt);
  console.log("--------------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
