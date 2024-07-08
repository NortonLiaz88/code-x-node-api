export interface DeleteUserRepository {
  deleteUser(id: number): Promise<void>;

  isRemovableUser(id: number): Promise<boolean>;
}
