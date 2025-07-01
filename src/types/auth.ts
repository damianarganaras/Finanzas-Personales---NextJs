export interface User {
  id: string;
  email: string;
  name?: string;
  verified: boolean;
  userGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGroup {
  id: string;
  title: string;
}
