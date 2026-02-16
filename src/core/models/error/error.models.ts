export interface HttpErrorResponseData {
  message?: string;
}

export interface HttpErrorResponse {
  data?: HttpErrorResponseData;
  status?: number;
  statusText?: string;
}

export interface HttpError {
  response?: HttpErrorResponse;
  message?: string;
}
