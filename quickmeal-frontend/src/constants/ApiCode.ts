//TypeScript đảm bảo tất cả key đều có value kiểu number, và không cho sửa lung tung.
export const ApiCode = {
    SUCCESS: 0,
    ERROR: 1,
    INVALID_PARAM: 2,
} as const satisfies Record<string, number>;
