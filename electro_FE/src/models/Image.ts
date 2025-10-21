export interface UploadedImageResponse {
  name: string;
  path: string;
  contentType: string;
  size: number;
}

/**
 * Cân nhắc đổi kiểu của id sang optional number
 */
export interface ImageRequest {
  id: string | null;
  name: string;
  path: string;
  contentType: string;
  size: number;
  group: string;
  isThumbnail: boolean;
  isEliminated: boolean;
}

export interface ImageResponse {
  id: string;
  name: string;
  path: string;
  contentType: string;
  size: number;
  group: string;
  isThumbnail: boolean;
  isEliminated: boolean;
}
