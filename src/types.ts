export type AnyObject = { [Key: string]: any };
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
