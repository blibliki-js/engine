export type AnyObject = { [Key: string]: any };
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
