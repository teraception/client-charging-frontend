export interface ContentMeta {}

export interface Content {
  id: string;
  name: string;
  type: string;
  relPath: string;
  url: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  meta: ContentMeta;
  absoluteUrl?: string;
}
