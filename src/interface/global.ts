export type TResponseData<T> = {
  status: number;
  message: string;
  meta?: {
    page: number,
    limit: number,
    total: number,
  };
  data?: T | null | undefined;
};