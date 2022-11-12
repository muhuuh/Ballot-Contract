// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

error Ballot__NotChairman(address chairman, address caller);

contract Ballot {
    struct Voter {
        uint weight; //weight is accumulated by delegation
        bool voted;
        address delegate;
        uint vote; //index of the voted proposal
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    address public chairman;
    address[] public votersAddresses;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        chairman = msg.sender;
        voters[chairman].weight = 1;
        votersAddresses.push(chairman);

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    fallback() external {
        chairman = msg.sender;
    }

    receive() external payable {}

    modifier onlyChairman() {
        if (chairman != msg.sender) {
            revert Ballot__NotChairman(chairman, msg.sender);
        }
        _;
    }

    function giveRightToVote(address voter) external onlyChairman {
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);

        voters[voter].weight = 1;
    }

    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "You have no right to vote");
        require(!sender.voted, "You already voted.");
        require(msg.sender != to, "Self-delegation not allowed");

        Voter storage delegate_ = voters[to];
        require(delegate_.weight >= 1);

        sender.voted = true;
        sender.delegate = to;

        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }

    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0);
        require(!sender.voted);
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() public view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function resetBallot(uint proposalIndex) external onlyChairman {
        //check if proposal already exist
        proposals[proposalIndex].voteCount = 0;
        /*
        for (uint i = 0; i < votersAddresses.length; i++) {
            if (votersAddresses[i] != chairman) {
                voters[votersAddresses[i]].weight = 0;
                voters[votersAddresses[i]].voted = false;
                voters[votersAddresses[i]].delegate = address(0);
                voters[votersAddresses[i]].vote = 0;
            }
        }
        */
        for (uint i = 0; i < votersAddresses.length; i++) {
            voters[votersAddresses[i]].weight = 0;
            voters[votersAddresses[i]].voted = false;
            voters[votersAddresses[i]].delegate = address(0);
            voters[votersAddresses[i]].vote = 0;
        }
        votersAddresses = new address[](0);
        votersAddresses.push(chairman);
        voters[chairman].weight = 1;
    }

    function transferChairMan(address to) external onlyChairman {
        chairman = to;
    }

    function getProposalsArray(uint index)
        public
        view
        returns (Proposal memory)
    {
        return proposals[index];
    }
}
