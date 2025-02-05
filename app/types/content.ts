export type MediaType = 'image' | 'video' | 'note' | 'link' | 'album';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  url?: string;
  cloudinaryId?: string;
  albumId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
