export interface Review {
  id: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  rating: number;
  title: string;
  comment: string;
  images: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}
