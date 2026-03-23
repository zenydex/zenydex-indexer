# Bug: Cancelled Offers Reappear as Active

**Status:** Root cause found, contract fix needed
**Date:** 2026-03-23
**Affected:** Offers #2 and #15 for lender `0xC77f...e19c`

## Root Cause

The FundingBook contract went through 3 versions of `cancelOffer`:

1. **Original** — `delete offers[_offerId]` (wipes entire struct, lender = address(0))
2. **`dd24b6e` (Mar 19)** — still deleted, tried to fix asset read-after-delete
3. **`bae03a8` (Mar 19)** — **stopped deleting**, now just sets `offer.amount = 0` (struct stays, lender still set)

The ghost offer fix `943a17c` (Feb 15) added a check in `repay()`:
```solidity
if (loan.autoRenew && offer.lender != address(0)) {
    offer.amount += paidTowardsPrincipal;
}
```

This worked when `cancelOffer` **deleted** the struct (lender became address(0)). But after `bae03a8` changed cancel to just zero the amount without deleting, **`offer.lender` stays set after cancel**. So repaid principal from autoRenew loans goes right back into the cancelled offer.

## Timeline for Offer #2

```
1. OfferCreated:     amount = $40, lender = 0xc77f
2. FundingFilled x3: amount reduced as loans are taken
3. OfferCanceled:    amount = 0 (but lender still 0xc77f — no delete)
4. Repaid (loan #14, autoRenew=true, AFTER cancel):
   → offer.lender != address(0) ✓ (still set!)
   → offer.amount += $10 (ghost refill)
5. On-chain: offer now has $10 in a "cancelled" offer
```

## Why the Indexer Shows It

The indexer correctly reflects on-chain state. It's not an indexer bug — the offers genuinely have amount > 0 on-chain because `repay()` put money back into them after cancel.

The on-chain structs now show as fully zeroed (lender = address(0)) because at some point the storage was wiped (possibly during a contract upgrade via UUPS). But the indexer doesn't track storage-level changes, only events.

## Contract Fix Needed

In `FundingBook.sol` `repay()` function (line 376), the autoRenew check needs to also verify the offer wasn't cancelled:

**Option A** — Zero `originalPrincipal` on cancel as a marker:
```solidity
// In cancelOffer:
offer.amount = 0;
offer.originalPrincipal = 0;  // marks as cancelled

// In repay:
if (loan.autoRenew && offer.lender != address(0) && offer.originalPrincipal > 0) {
    offer.amount += paidTowardsPrincipal;
}
```

**Option B** — Add a `cancelled` bool to the Offer struct:
```solidity
struct Offer { ..., bool cancelled; }

// In cancelOffer:
offer.amount = 0;
offer.cancelled = true;

// In repay:
if (loan.autoRenew && !offer.cancelled) { ... }
```

**Option C** — Zero the lender on cancel (like the old code, but keep struct for other reads):
```solidity
// In cancelOffer:
offer.amount = 0;
offer.lender = address(0);  // prevents autoRenew re-fill
```

Option A is simplest — no struct change, no storage slot issues with UUPS upgrades.

## Indexer Fix (after contract fix)

Once the contract is fixed and upgraded, reindex. The `OfferCanceled` handler currently works correctly — it sets status to CANCELED and amount to 0. The issue was that on-chain state diverged from event-derived state because of the autoRenew re-fill happening outside of events.

## Relevant Commits

- `bae03a8` — Changed cancelOffer from delete to amount-zeroing (introduced bug)
- `943a17c` — Ghost offer fix (checks lender != address(0), insufficient after bae03a8)
- `dd24b6e` — Intermediate cancel fix attempt
- `64d3ea6` — Allow cancel on fully-lent autoRenew offers

## Files

- `zeny-dex-contracts/src/FundingBook.sol` — `cancelOffer()` (line 224), `repay()` autoRenew (line 376)
- `zeny-dex-indexer/src/FundingBook.ts` — `OfferCanceled` handler (line 305)
