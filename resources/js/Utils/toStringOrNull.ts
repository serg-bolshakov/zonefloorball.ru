export const toStringOrNull = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    return String(value);
};