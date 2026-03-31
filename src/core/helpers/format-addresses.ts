import { AddressInput } from "@models";

export const formatAddressesForPayload = (addresses: AddressInput[]): AddressInput[] => {
    if (!addresses) return [];

    return addresses
        .filter((addr) => addr.address_line && addr.address_line.trim() !== "")
        .map((addr) => ({
            address_line: addr.address_line.trim(),
            reference: addr.reference || null,
            department: addr.department || null,
            province: addr.province || null,
            district: addr.district || null,
            is_default: !!addr.is_default
        })) as AddressInput[];
};
