export function toSnakeCase<T extends object>(obj: T): any {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        // e.g. preferredGender → preferred_gender
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = value;
    }
    return result;
}