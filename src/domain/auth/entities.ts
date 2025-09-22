import type { EmailAddress, PasswordHash } from "./valueObjects";

export type UserProps = {
  id: number;
  email: EmailAddress;
  name?: string | null;
  passwordHash: PasswordHash;
  createdAt: Date;
};

export class User {
  readonly id: number;
  readonly email: EmailAddress;
  readonly name?: string | null;
  readonly passwordHash: PasswordHash;
  readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }
}

export type SessionProps = {
  id: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
};

export class Session {
  readonly id: string;
  readonly userId: number;
  readonly expiresAt: Date;
  readonly createdAt: Date;

  constructor(props: SessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }
}
