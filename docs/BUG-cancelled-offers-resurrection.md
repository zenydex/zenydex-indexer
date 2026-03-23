# Bug: Cancelled Offers Reappear as Active in Indexer

**Status:** Workaround in place (frontend on-chain verification), root cause unresolved
**Date:** 2026-03-23
**Affected:** Offers #2 and #15 for lender `0xC77f79048B50B16c3a7A0eCAd5Bd9BbF6Bffe19c`

## Symptom

User sees cancelled offers in "Your Active Offers" with amounts ($15.00 and $10.00) and "Lending" badges, even though the offers are fully zeroed on-chain (lender = address(0), amount = 0).

## On-chain verification

```bash
# Both return all zeros — struct is deleted
cast call 0xF1e4944cd45ED647c57A10B3D88D974d84E68145 "offers(uint256)((address,address,uint128,uint128,uint128,uint32,uint32,bool))" 2 --rpc-url https://mainnet.base.org
cast call 0xF1e4944cd45ED647c57A10B3D88D974d84E68145 "offers(uint256)((address,address,uint128,uint128,uint128,uint32,uint32,bool))" 15 --rpc-url https://mainnet.base.org
```

## What we know

1. **Both offers were cancelled on-chain** — `cancelOffer()` was called and `OfferCanceled` events were emitted:
   - Offer #2: tx `0xd188e928...` at block 43065694 (ts 1772920735)
   - Offer #15: tx `0x2a54a30f...` at block ~43200000 (ts 1773481945)

2. **The indexer recorded the CANCELED events** — querying `OfferEvent` shows both CREATED and CANCELED records with correct timestamps in chronological order.

3. **The `OfferCanceled` handler sets `status: "CANCELED"` and `amount: 0n`** — code at `src/FundingBook.ts:313-316`:
   ```ts
   await context.db.update(Offer, { id: offerId }).set({
     status: "CANCELED",
     amount: 0n,
   });
   ```

4. **Despite this, the Offer record shows `status: "ACTIVE"` with non-zero amounts** after a complete reindex. The `db.update` appears to run (the OfferEvent is inserted in the same handler), but the Offer record is not updated — or something overwrites it afterward.

5. **No FundingFilled events occur after the cancel** for these offers. So the `FundingFilled` handler's status reset (which we fixed to preserve CANCELED status in commit `edb4a11`) is NOT the cause for these specific offers.

6. **Both offers had autoRenew: true** with loans that were repaid after the cancel. The contract's `repay()` function adds repaid principal back to the offer via `offer.amount += paidTowardsPrincipal` when `autoRenew && offer.lender != address(0)`. But on-chain, `cancelOffer()` does NOT zero the lender — only sets amount to 0. So the contract does re-fill cancelled offers if autoRenew loans are repaid after cancel. However, the contract does NOT emit an event for this re-fill, and later the struct gets zeroed when the loan is deleted.

## Theories to investigate

### Theory A: Silent autoRenew re-fill (most likely)
The contract's `repay()` does `offer.amount += paidTowardsPrincipal` when `autoRenew && offer.lender != address(0)`. Since `cancelOffer()` doesn't zero the lender, repayments after cancel re-fill the offer on-chain (temporarily). The indexer can't see this because no event is emitted. But then later, when the loan struct is deleted and the offer has no more loans, the on-chain state diverges from the indexer.

The indexer sees:
- OfferCreated → amount = 40M, status = ACTIVE
- FundingFilled → amount reduced
- OfferCanceled → amount = 0, status = CANCELED
- Repaid → no change to Offer table (indexer doesn't modify offers on repay)

But somehow the final state is amount = 10M, status = ACTIVE. This suggests:
- Either the `db.update` in the cancel handler silently fails
- Or Ponder's event processing order differs from what we assume

### Theory B: Ponder db.update silent failure
The `db.update` call might not throw but also not write in certain race conditions or when the record was recently modified by another handler in the same block. Ponder processes events sequentially within a block but there could be edge cases with its internal batching.

### Theory C: Ponder reorg/checkpoint issue
If the cancel event's block was near a reorg boundary during indexing, Ponder might have reverted the cancel but not re-applied it. Unlikely on Base (fast finality) but worth checking.

## How to investigate

1. **Add logging to the OfferCanceled handler** — log the offer state before and after the update to see if it actually executes:
   ```ts
   const before = await context.db.find(Offer, { id: offerId });
   console.log(`[cancel] offer ${offerId} before:`, before?.status, before?.amount?.toString());
   await context.db.update(Offer, { id: offerId }).set({ status: "CANCELED", amount: 0n });
   const after = await context.db.find(Offer, { id: offerId });
   console.log(`[cancel] offer ${offerId} after:`, after?.status, after?.amount?.toString());
   ```

2. **Check if another handler runs after OfferCanceled in the same block** — look at all events in block 43065694 from the FundingBook contract.

3. **Test with a fresh local reindex** — run `ponder dev` locally against Base mainnet and watch the console output for offers #2 and #15.

4. **Check the FundingBook contract source** — verify if `cancelOffer()` has been modified since deploy. The contract was upgraded/changed at some point per the user.

## Current workaround

Frontend (`zenydex-ui/src/app/dapp/lend/page.tsx`) now verifies each offer on-chain by reading `offers(id)` from the FundingBook contract. If `lender == address(0)`, the offer is filtered out before display. Commit `6fb696d`.

## Files involved

- **Indexer handler:** `zeny-dex-indexer/src/FundingBook.ts` — `OfferCanceled` handler (line 305)
- **Indexer ABI:** `zeny-dex-indexer/abis/funding-book.ts` — `OfferCanceled` event (line 425)
- **Contract:** `zeny-dex-contracts/src/FundingBook.sol` — `cancelOffer()` (line 224), `repay()` autoRenew logic (line 376)
- **Frontend workaround:** `zenydex-ui/src/app/dapp/lend/page.tsx` — on-chain verification query
