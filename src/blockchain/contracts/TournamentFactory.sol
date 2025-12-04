// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./TRIZcoin.sol";

contract TournamentFactory is Ownable {
    TRIZcoin public token;

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = TRIZcoin(tokenAddress);
    }

    enum Status {
        Pending,
        OnGoing,
        Finished,
        Expired
    }

    struct Player {
        address addr;
        bool claimed;
        string username;
    }

    struct Match {
        Player player1;
        uint player1Score;
        Player player2;
        uint player2Score;
        Status status;
    }

    struct Tournament {
        uint id;
        string title;
        uint entryFee;
        uint8 participants;
        uint8 maxParticipants;
        uint currentRound;
        uint startTime;
        Status status;
    }

    Tournament[] public tournaments;
    mapping(bytes32 => Match) matches;
    mapping(bytes32 => Player) players;

    function getMatchKey(
        uint tournamentId,
        uint round,
        uint matchNumber
    ) public pure returns (bytes32) {
        return (keccak256(abi.encodePacked(tournamentId, round, matchNumber)));
    }

    function getPlayerKey(
        uint tournamentId,
        uint round,
        uint index
    ) public pure returns (bytes32) {
        return (keccak256(abi.encodePacked(tournamentId, round, index)));
    }

    event TournamentCreated(
        uint id,
        uint entryFee,
        uint8 participants,
        uint startDate,
        Status status
    );

    function getTournamentLength() external view returns (uint) {
        return (tournaments.length);
    }

    function createTournament(
        string memory _title,
        uint _entryFee,
        uint8 _maxParticipants,
        uint _startTime,
        string memory _username
    ) external {
        // require(msg.sender == owner, AdminOnly(msg.sender));
        require(
            token.transferFrom(msg.sender, address(this), _entryFee),
            "not enough cash stranger"
        );

        // Match[] memory initMatches = new Match[](1);
        // initMatches[0] = Match({
        //     player1: msg.sender,
        //     player1Score: 0,
        //     player2: address(0),
        //     player2Score: 0,
        //     status: Status.Pending
        // });

        tournaments.push(
            Tournament({
                id: tournaments.length,
                title: _title,
                entryFee: _entryFee,
                participants: 1,
                maxParticipants: _maxParticipants,
                currentRound: _maxParticipants / 2,
                startTime: _startTime,
                status: Status.Pending
                // matches: initMatches
            })
        );

        Player memory player = Player({
            addr: msg.sender,
            claimed: false,
            username: _username
        });

        players[
            getPlayerKey(tournaments.length - 1, _maxParticipants / 2, 0)
        ] = player;
        // emit TournamentCreated(
        //     tournaments.length,
        //     _entryFee,
        //     _maxParticipants,
        //     _startTime,
        //     Status.Pending
        // );
    }

    function getTournaments() external view returns (Tournament[] memory) {
        return (tournaments);
    }

    function getTournament(uint id) external view returns (Tournament memory) {
        return (tournaments[id]);
    }

    function setTournamentStatus(Status _statue, uint _id) external {
        Tournament storage t = tournaments[_id];
        t.status = _statue;
    }

    function getPlayer(
        uint tournamentId,
        uint8 round,
        uint16 index
    ) external view returns (Player memory) {
        return (players[getPlayerKey(tournamentId, round, index)]);
    }

    function joinTournament(uint _id, string memory _username) external {
        Tournament storage t = tournaments[_id];
        require(t.status == Status.Pending, "tournament isn't pending");
        require(t.startTime > block.timestamp, "deadline reached");
        require(t.participants < t.maxParticipants, "tournament is full");
        require(
            token.transferFrom(msg.sender, address(this), t.entryFee),
            "not enough cash stranger"
        );

        t.participants++;

        Player memory player = Player({
            addr: msg.sender,
            claimed: false,
            username: _username
        });
        players[getPlayerKey(_id, t.currentRound, t.participants - 1)] = player;
    }

    function takeRefunds(uint _id, uint16 _index) external {
        Tournament memory t = tournaments[_id];
        Player storage p = players[getPlayerKey(_id, t.currentRound, _index)];
        require(
            t.status == Status.Expired && t.startTime < block.timestamp,
            "tournament isn't expired"
        );
        require(!p.claimed, "user already claimed refund");
        p.claimed = true;
        token.transfer(msg.sender, t.entryFee);
    }

    function startTournament(
        uint _id,
        uint[] calldata order
    ) external onlyOwner {
        Tournament storage t = tournaments[_id];
        t.status = Status.OnGoing;

        uint j = 0;
        for (uint i = 0; i < order.length; i += 2) {
            Player memory p1 = players[getPlayerKey(_id, t.currentRound, i)];
            Player memory p2 = players[
                getPlayerKey(_id, t.currentRound, i + 1)
            ];
            Match memory m = Match({
                player1: p1,
                player1Score: 0,
                player2: p2,
                player2Score: 0,
                status: Status.Pending
            });
            matches[getMatchKey(_id, t.currentRound, i)] = m;
            j++;
        }
    }

    function getMatch(
        uint _id,
        uint _round,
        uint _matchId
    ) external view returns (Match memory) {
        return (matches[getMatchKey(_id, _round, _matchId)]);
    }
}
