// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { PrivateVoteSimulator } from "./private-vote-simulator.js";
import * as crypto from "crypto";

setNetworkId("undeployed");

function randomBytes(length: number): Uint8Array {
  return new Uint8Array(crypto.randomBytes(length));
}

describe("PrivateVoteContract", () => {
  it("initializes with poll open and zero counts", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);
    const ledger = sim.getLedger();
    expect(ledger.pollOpen).toBe(true);
    expect(ledger.voteCount).toBe(0n);
    expect(ledger.yesCount).toBe(0n);
    expect(ledger.noCount).toBe(0n);
  });

  it("castPrivateVote(true) increments voteCount and yesCount", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.switchUser(randomBytes(32), false);
    sim.castPrivateVote(true);

    const ledger = sim.getLedger();
    expect(ledger.voteCount).toBe(1n);
    expect(ledger.yesCount).toBe(1n);
    expect(ledger.noCount).toBe(0n);
  });

  it("castPrivateVote(false) increments voteCount and noCount", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.switchUser(randomBytes(32), false);
    sim.castPrivateVote(false);

    const ledger = sim.getLedger();
    expect(ledger.voteCount).toBe(1n);
    expect(ledger.yesCount).toBe(0n);
    expect(ledger.noCount).toBe(1n);
  });

  it("prevents double voting with same secret key", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    const userKey = randomBytes(32);
    sim.switchUser(userKey, false);
    sim.castPrivateVote(true);

    expect(() => sim.castPrivateVote(false)).toThrow();
  });

  it("different users can each vote once", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.switchUser(randomBytes(32), false);
    sim.castPrivateVote(true);

    sim.switchUser(randomBytes(32), false);
    sim.castPrivateVote(false);

    const ledger = sim.getLedger();
    expect(ledger.voteCount).toBe(2n);
    expect(ledger.yesCount).toBe(1n);
    expect(ledger.noCount).toBe(1n);
  });

  it("closePoll prevents further voting", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.closePoll();

    sim.switchUser(randomBytes(32), false);
    expect(() => sim.castPrivateVote(true)).toThrow();
  });

  it("only admin can close the poll", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.switchUser(randomBytes(32), false);
    expect(() => sim.closePoll()).toThrow();
  });

  it("getResults returns correct counts after poll closes", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    sim.switchUser(randomBytes(32), false);
    sim.castPrivateVote(true);

    sim.switchUser(adminKey, true);
    sim.closePoll();

    const results = sim.getResults();
    expect(results[0]).toBe(1n);
    expect(results[1]).toBe(1n);
    expect(results[2]).toBe(0n);
  });

  it("multiple users vote and results are correct", () => {
    const adminKey = randomBytes(32);
    const sim = new PrivateVoteSimulator(adminKey, true);

    for (let i = 0; i < 5; i++) {
      sim.switchUser(randomBytes(32), false);
      sim.castPrivateVote(i % 2 === 0); // 3 yes, 2 no
    }

    sim.switchUser(adminKey, true);
    sim.closePoll();

    const results = sim.getResults();
    expect(results[0]).toBe(5n);
    expect(results[1]).toBe(3n);
    expect(results[2]).toBe(2n);
  });
});
