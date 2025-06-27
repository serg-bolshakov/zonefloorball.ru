// Utils/checkHelpers.ts
export const checkNonEmptyString = (value: string | undefined | null) => {
    return value && value.trim() !== '';
};
