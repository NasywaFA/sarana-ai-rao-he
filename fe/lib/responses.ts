export interface CommonResponse<T = any> {
  id: string | undefined;
  isSuccess: boolean;
  data: T | null;
  message: string;
}