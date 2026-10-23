import { pavosToCents } from "../../lib/pricing";

export interface Transaction {
  id: string;
  gameAccountID: string;
  senderName?: string | null;
  receiverID?: string | null;
  receiverName?: string | null;
  objectStoreID: string;
  objectStoreName: string;
  regularPrice: number;
  finalPrice: number;
  giftImage: string;
  createdAt: string;
}

export interface rawTransactionsResponse {
  success: boolean;
  transactions: Transaction[];
}

/** Special object-store ids the backend uses for rows that are not web gifts. */
export const MANUAL_ADJUSTMENT_ID = "manual-adjustment";
export const EPIC_HISTORY_ID = "epic-history";

export type TransactionKind = "gift" | "manual" | "game";

/**
 * A "gift" is one sent from this web. Manual slot adjustments and gifts read
 * from Epic's history (sent from inside the game) are shown in the history but
 * are not sales: they have no price and must not count in the statistics.
 */
export const transactionKind = (objectStoreID?: string | null): TransactionKind =>
  objectStoreID === MANUAL_ADJUSTMENT_ID ? "manual"
    : objectStoreID === EPIC_HISTORY_ID ? "game" : "gift";

export const isWebGift = (objectStoreID?: string | null) => transactionKind(objectStoreID) === "gift";

/** Converts a transaction as the API sends it (PascalCase keys) into the UI model. */
export const mapTransaction = (tx: any): Transaction => ({
  id: tx.ID, gameAccountID: tx.GameAccountID,
  senderName: tx.SenderName || null,
  receiverID: tx.ReceiverID, receiverName: tx.ReceiverName,
  objectStoreID: tx.ObjectStoreID, objectStoreName: tx.ObjectStoreName,
  regularPrice: tx.RegularPrice, finalPrice: tx.FinalPrice,
  giftImage: tx.GiftImage, createdAt: tx.CreatedAt,
});

/** Sort comparator: newest first (the UI never relies on the server order). */
export const newestFirst = (a: Transaction, b: Transaction) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/**
 * Sales statistics. Only gifts sent from this web count: manual slot
 * adjustments and gifts read from Epic's history are not sales. The soles total
 * adds the price of each gift (rounded per gift, as it is charged).
 */
export function salesStats(transactions: Transaction[]) {
  const gifts = transactions.filter(t => isWebGift(t.objectStoreID));
  return {
    gifts: gifts.length,
    pavos: gifts.reduce((sum, t) => sum + (t.finalPrice || 0), 0),
    cents: gifts.reduce((sum, t) => sum + pavosToCents(t.finalPrice || 0), 0),
    receivers: new Set(gifts.map(t => t.receiverName)).size,
    senders: new Set(gifts.map(t => t.senderName).filter(Boolean)).size,
  };
}
