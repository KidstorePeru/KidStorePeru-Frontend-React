export interface GiftSlotStatus {
    remaining_gifts: number;
    max_gifts: number;
    used_gifts: number;
    next_slot_available: string | null;
    time_until_next_slot: string | null;
    slot_expiry_times: string[];
}

export type Account = {
    id: string;
    displayName: string;
    pavos: number;
    remainingGifts: number;
    giftSlotStatus?: GiftSlotStatus;
    /** When the pavos were last read from Epic (ISO). Absent if never synced. */
    pavosSyncedAt?: string | null;
};

export type rawAccount = {
    id: string;
    displayName: string;
    pavos: number;
    remainingGifts: number;
    giftSlotStatus?: GiftSlotStatus;
    pavosSyncedAt?: string | null;
};

export type rawAccountResponse = {
    success: boolean;
    gameAccounts: rawAccount[];
};

/** Converts an account as sent by the API into the UI model. */
export const mapAccount = (acc: rawAccount): Account => ({
    id: acc.id,
    displayName: acc.displayName,
    pavos: acc.pavos ?? 0,
    remainingGifts: acc.remainingGifts ?? 0,
    giftSlotStatus: acc.giftSlotStatus,
    pavosSyncedAt: acc.pavosSyncedAt ?? null,
});
