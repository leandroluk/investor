export abstract class UserRepository {
  abstract existsByEmail(email: string): Promise<boolean>;
}
