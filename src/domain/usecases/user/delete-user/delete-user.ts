export interface DeleteUser {
  deleteUser(id: number): Promise<void>;

  isRemovableUser(id: number): Promise<boolean>;
}
