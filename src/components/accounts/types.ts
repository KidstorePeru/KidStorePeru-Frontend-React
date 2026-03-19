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
};

export type rawAccount = {
    id: string;
    displayName: string;
    pavos: number;
    remainingGifts: number;
    giftSlotStatus?: GiftSlotStatus;
};

export type rawAccountResponse = {
    success: boolean;
    gameAccounts: rawAccount[];
};