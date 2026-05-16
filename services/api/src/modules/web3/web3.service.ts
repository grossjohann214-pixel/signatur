import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ethers } from 'ethers';

// ABI minimo do SGLEvidenceAnchor
const ANCHOR_ABI = [
  "function anchorEvidence(bytes32 _evidenceId, bytes32 _evidenceHash, bytes32 _procedureId, address _participantWallet, string calldata _protocolNumber) external",
  "function verifyEvidence(bytes32 _evidenceId) external view returns (bytes32 evidenceHash, bytes32 procedureId, address participantWallet, string protocolNumber, uint256 timestamp, bool exists)",
  "function getEvidenceCount() external view returns (uint256)",
  "event EvidenceAnchored(bytes32 indexed evidenceId, bytes32 indexed evidenceHash, bytes32 indexed procedureId, address participantWallet, string protocolNumber, uint256 timestamp)"
];

@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;

  constructor(private prisma: PrismaService) {
    this.init();
  }

  private init() {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.VALIDATOR_PRIVATE_KEY;
    const contractAddress = process.env.EVIDENCE_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      this.logger.warn('Web3 not configured — anchoring will be skipped. Set SEPOLIA_RPC_URL, VALIDATOR_PRIVATE_KEY, EVIDENCE_CONTRACT_ADDRESS');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, ANCHOR_ABI, this.wallet);
    this.logger.log(`Web3 initialized. Contract: ${contractAddress}`);
  }

  isConfigured(): boolean {
    return this.contract !== null;
  }

  async anchorEvidence(params: {
    evidenceId: string;
    evidenceHash: string;
    procedureId: string;
    participantWallet: string;
    protocolNumber: string;
  }): Promise<{ txHash: string; blockNumber: number | null } | null> {
    if (!this.contract || !this.wallet) {
      this.logger.warn('Web3 not configured, skipping anchor');
      return null;
    }

    const evidenceIdBytes = ethers.id(params.evidenceId);
    const evidenceHashBytes = ethers.id(params.evidenceHash);
    const procedureIdBytes = ethers.id(params.procedureId);
    const walletAddr = params.participantWallet || ethers.ZeroAddress;

    try {
      const tx = await this.contract.anchorEvidence(
        evidenceIdBytes,
        evidenceHashBytes,
        procedureIdBytes,
        walletAddr,
        params.protocolNumber,
      );

      this.logger.log(`Tx sent: ${tx.hash}`);

      // Save pending tx
      await this.prisma.web3Transaction.create({
        data: {
          procedure_id: params.procedureId,
          tx_hash: tx.hash,
          status: 'pending',
        },
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update with block number
      await this.prisma.web3Transaction.updateMany({
        where: { tx_hash: tx.hash },
        data: {
          block_number: receipt?.blockNumber || null,
          status: 'confirmed',
          timestamp: new Date(),
        },
      });

      this.logger.log(`Tx confirmed: ${tx.hash} block ${receipt?.blockNumber}`);
      return { txHash: tx.hash, blockNumber: receipt?.blockNumber || null };
    } catch (error: any) {
      this.logger.error(`Anchor failed: ${error.message}`);

      // Save failed tx
      await this.prisma.web3Transaction.create({
        data: {
          procedure_id: params.procedureId,
          tx_hash: error.transactionHash || 'failed',
          status: 'failed',
        },
      });

      return null;
    }
  }

  async verifyEvidence(evidenceId: string) {
    if (!this.contract) return null;
    const evidenceIdBytes = ethers.id(evidenceId);
    const result = await this.contract.verifyEvidence(evidenceIdBytes);
    return {
      evidenceHash: result.evidenceHash,
      procedureId: result.procedureId,
      participantWallet: result.participantWallet,
      protocolNumber: result.protocolNumber,
      timestamp: Number(result.timestamp),
      exists: result.exists,
    };
  }
}
