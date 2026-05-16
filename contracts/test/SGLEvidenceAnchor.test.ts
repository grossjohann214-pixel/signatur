import { expect } from "chai";
import { ethers } from "hardhat";
import { SGLEvidenceAnchor } from "../typechain-types";

describe("SGLEvidenceAnchor", function () {
  let anchor: SGLEvidenceAnchor;
  let owner: any;
  let other: any;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SGLEvidenceAnchor");
    anchor = await Factory.deploy();
    await anchor.waitForDeployment();
  });

  const evidenceId = ethers.id("evidence-001");
  const evidenceHash = ethers.id("hash-of-evidence-payload");
  const procedureId = ethers.id("procedure-001");
  const wallet = ethers.getAddress("0x1234567890abcdef1234567890abcdef12345678");
  const protocol = "SGL-TEST-ABC123";

  it("anchors evidence successfully", async function () {
    const tx = await anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol);
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;

    const count = await anchor.getEvidenceCount();
    expect(count).to.equal(1n);
  });

  it("emits EvidenceAnchored event", async function () {
    await expect(anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol))
      .to.emit(anchor, "EvidenceAnchored")
      .withArgs(evidenceId, evidenceHash, procedureId, wallet, protocol, (ts: any) => ts > 0n);
  });

  it("verifies anchored evidence", async function () {
    await anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol);

    const result = await anchor.verifyEvidence(evidenceId);
    expect(result.evidenceHash).to.equal(evidenceHash);
    expect(result.procedureId).to.equal(procedureId);
    expect(result.participantWallet).to.equal(wallet);
    expect(result.protocolNumber).to.equal(protocol);
    expect(result.exists).to.be.true;
  });

  it("rejects duplicate evidence", async function () {
    await anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol);
    await expect(
      anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol)
    ).to.be.revertedWith("Evidence already anchored");
  });

  it("rejects zero hash", async function () {
    await expect(
      anchor.anchorEvidence(evidenceId, ethers.ZeroHash, procedureId, wallet, protocol)
    ).to.be.revertedWith("Invalid evidence hash");
  });

  it("rejects non-owner", async function () {
    await expect(
      anchor.connect(other).anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol)
    ).to.be.revertedWithCustomError(anchor, "OwnableUnauthorizedAccount");
  });

  it("returns false for non-existent evidence", async function () {
    const result = await anchor.verifyEvidence(ethers.id("nonexistent"));
    expect(result.exists).to.be.false;
  });

  it("tracks evidence count", async function () {
    expect(await anchor.getEvidenceCount()).to.equal(0n);
    await anchor.anchorEvidence(evidenceId, evidenceHash, procedureId, wallet, protocol);
    expect(await anchor.getEvidenceCount()).to.equal(1n);

    const id2 = ethers.id("evidence-002");
    await anchor.anchorEvidence(id2, evidenceHash, ethers.id("proc-002"), wallet, "SGL-TEST-DEF456");
    expect(await anchor.getEvidenceCount()).to.equal(2n);
  });
});
