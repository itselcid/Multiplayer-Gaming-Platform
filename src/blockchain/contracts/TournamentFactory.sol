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
        uint participants;
        uint maxParticipants;
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

    // TODO: review if round isn't needed
    function getPlayerKey(
        uint tournamentId,
        uint round,
        uint index
    ) public pure returns (bytes32) {
        return (keccak256(abi.encodePacked(tournamentId, round, index)));
    }

    event TournamentCreated(uint _id);

    function getTournamentLength() external view returns (uint) {
        return (tournaments.length);
    }

    function createTournament(
        string memory _title,
        uint _entryFee,
        uint _maxParticipants,
        uint _startTime,
        string memory _username
    ) external {
        require(
            token.transferFrom(msg.sender, address(this), _entryFee),
            "not enough cash stranger"
        );

        // 1. Title length: 3–20 characters
        uint titleLength = bytes(_title).length;
        require(titleLength >= 3 && titleLength <= 20, "Title length invalid");

        // 2. Username length: 3–20 characters
        uint usernameLength = bytes(_username).length;
        require(
            usernameLength >= 3 && usernameLength <= 20,
            "Username length invalid"
        );

        // 3. Entry fee must be positive
        require(_entryFee > 0, "Entry fee must be > 0");

        // 4. Max participants must be a power of two (1, 2, 4, 8, 16, ...)
        require(
            _maxParticipants > 1 &&
                (_maxParticipants & (_maxParticipants - 1)) == 0,
            "Max participants must be power of 2"
        );

        // 5. Start time must be in the future
        require(
            _startTime > block.timestamp,
            "Start time must be in the future"
        );

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

        emit TournamentCreated(tournaments.length - 1);
    }

    function getTournaments() external view returns (Tournament[] memory) {
        return (tournaments);
    }

    function getTournament(uint id) external view returns (Tournament memory) {
        return (tournaments[id]);
    }

    event SetStatus(uint _id);

    function setTournamentStatus(Status _statue, uint _id) external {
        Tournament storage t = tournaments[_id];
        t.status = _statue;
        emit SetStatus(_id);
    }

    function getPlayer(
        uint tournamentId,
        uint round,
        uint index
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

    function claimRefunds(uint _id, uint _index) external {
        Tournament memory t = tournaments[_id];
        Player storage p = players[getPlayerKey(_id, t.currentRound, _index)];
        require(
            t.status == Status.Expired && t.startTime < block.timestamp,
            "tournament isn't expired"
        );
        require(p.addr == msg.sender, "Trying to withdraw other user's funds");
        require(!p.claimed, "user already claimed refund");
        p.claimed = true;
        token.transfer(msg.sender, t.entryFee);
    }

    function claimPrize(uint _id, uint _index) external {
        require(_index == 0 || _index == 1, "Player index out of range");
        require(
            _id >= 0 && _id < tournaments.length,
            "Tournamnet id out of range"
        );
        Tournament memory t = tournaments[_id];
        require(t.status == Status.Finished, "Tournament isn't finished");
        Match storage last_match = matches[getMatchKey(_id, 1, 0)];
        require(
            last_match.status == Status.Finished,
            "Last match isn't finished"
        );
        if (last_match.player1Score > last_match.player2Score) {
            require(
                last_match.player1.addr == msg.sender,
                "Keep dreaming of winning"
            );
            require(!last_match.player1.claimed, "Prize already claimed");
            last_match.player1.claimed = true;
        } else {
            require(
                last_match.player2.addr == msg.sender,
                "Keep dreaming of winning"
            );
            require(!last_match.player2.claimed, "Prize already claimed");
            last_match.player2.claimed = true;
        }
        token.transfer(msg.sender, t.entryFee * t.maxParticipants);
    }

    function createRound(uint _id, uint[] calldata order) public onlyOwner {
        Tournament memory t = tournaments[_id];
        uint j = 0;
        for (uint i = 0; i < order.length; i += 2) {
            Player memory p1 = players[
                getPlayerKey(_id, t.currentRound, order[i])
            ];
            Player memory p2 = players[
                getPlayerKey(_id, t.currentRound, order[i + 1])
            ];
            createMatch(_id, t.currentRound, j, p1, p2);
            j++;
        }
    }

    function startTournament(
        uint _id,
        uint[] calldata order
    ) external onlyOwner {
        Tournament storage t = tournaments[_id];
        t.status = Status.OnGoing;
        createRound(_id, order);
        emit SetStatus(_id);
    }

    function createNextRound(
        uint _id,
        uint[] calldata order
    ) external onlyOwner {
        Tournament storage t = tournaments[_id];
        t.currentRound /= 2;
        createRound(_id, order);
    }

    event MatchCreated(uint _id, uint _round, uint _matchId);

    function createMatch(
        uint _id,
        uint _round,
        uint _matchId,
        Player memory p1,
        Player memory p2
    ) public onlyOwner {
        Match memory tmp_match = Match({
            player1: p1,
            player1Score: 0,
            player2: p2,
            player2Score: 0,
            status: Status.Pending
        });
        matches[getMatchKey(_id, _round, _matchId)] = tmp_match;
        emit MatchCreated(_id, _round, _matchId);
    }

    event MatchFinished(uint _id, uint _round, uint _matchId);

    function submitMatchScore(
        uint _id,
        uint _round,
        uint _matchId,
        uint _score_1,
        uint _score_2
    ) external onlyOwner {
        Match storage the_match = matches[getMatchKey(_id, _round, _matchId)];
        the_match.player1Score = _score_1;
        the_match.player2Score = _score_2;
        the_match.status = Status.Finished;
        Player memory winner;
        if (_score_1 > _score_2) winner = the_match.player1;
        else winner = the_match.player2;
        if (_round != 1) {
            players[getPlayerKey(_id, _round / 2, _matchId)] = winner;
        }
        emit MatchFinished(_id, _round, _matchId);
    }

    function getMatch(
        uint _id,
        uint _round,
        uint _matchId
    ) public view returns (Match memory) {
        return (matches[getMatchKey(_id, _round, _matchId)]);
    }

    function getMatchWithKey(
        bytes32 _key
    ) external view returns (Match memory) {
        return (matches[_key]);
    }
}
