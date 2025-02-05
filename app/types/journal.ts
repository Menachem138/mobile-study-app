export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface JournalTag {
  id: string;
  name: string;
  count: number;
}

export interface RichTextBlock {
  type: 'paragraph' | 'heading1' | 'heading2' | 'bulletList' | 'checklist' | 'image';
  content: string;
  checked?: boolean;
  imageUrl?: string;
}
