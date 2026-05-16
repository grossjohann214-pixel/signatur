// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SGLEvidenceAnchor is Ownable {
    struct EvidenceRecord {
        bytes32 evidenceHash;
        bytes32 procedureId;
        address participantWallet;
        string protocolNumber;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => EvidenceRecord) public evidences;
    bytes32[] public evidenceIds;

    event EvidenceAnchored(
        bytes32 indexed evidenceId,
        bytes32 indexed evidenceHash,
        bytes32 indexed procedureId,
        address participantWallet,
        string protocolNumber,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function anchorEvidence(
        bytes32 _evidenceId,
        bytes32 _evidenceHash,
        bytes32 _procedureId,
        address _participantWallet,
        string calldata _protocolNumber
    ) external onlyOwner {
        require(!evidences[_evidenceId].exists, "Evidence already anchored");
        require(_evidenceHash != bytes32(0), "Invalid evidence hash");

        evidences[_evidenceId] = EvidenceRecord({
            evidenceHash: _evidenceHash,
            procedureId: _procedureId,
            participantWallet: _participantWallet,
            protocolNumber: _protocolNumber,
            timestamp: block.timestamp,
            exists: true
        });

        evidenceIds.push(_evidenceId);

        emit EvidenceAnchored(
            _evidenceId,
            _evidenceHash,
            _procedureId,
            _participantWallet,
            _protocolNumber,
            block.timestamp
        );
    }

    function verifyEvidence(bytes32 _evidenceId) external view returns (
        bytes32 evidenceHash,
        bytes32 procedureId,
        address participantWallet,
        string memory protocolNumber,
        uint256 timestamp,
        bool exists
    ) {
        EvidenceRecord memory r = evidences[_evidenceId];
        return (r.evidenceHash, r.procedureId, r.participantWallet, r.protocolNumber, r.timestamp, r.exists);
    }

    function getEvidenceCount() external view returns (uint256) {
        return evidenceIds.length;
    }
}
