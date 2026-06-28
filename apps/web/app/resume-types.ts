export interface Resume {
  id: string;
  displayName: string;
  originalFilename: string;
  uploadDate: string;
  size: number;
  mimeType: string;
  version: number;
  isPrimary: boolean;
}

export interface ResumeListResponse {
  resumes: Resume[];
}
