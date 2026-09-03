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
