interface BaseVideo {
  id: string;
  title: string;
  description: string;
  tagsInput?: string;
  tags: string[];
}

export interface VideoInput extends BaseVideo {
  thumbnail: string | StaticImageData;
  videoFile?: File;
}

export interface VideoStored extends BaseVideo {
  thumbnail: File;
  videoFile: File;
  isPublic?: Boolean;
}

export type VideoForm = Partial<VideoStored> & {
  thumbnailPreview?: string;
  videoPreview?: string;
};

export type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

export type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};
