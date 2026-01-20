export type TBlog = {
  title: string;
  content: string;
  thumbnail?: string;
  specialtiesId: string;
  authorId: string;
  isPublished?: boolean;
};