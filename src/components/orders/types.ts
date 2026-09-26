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
