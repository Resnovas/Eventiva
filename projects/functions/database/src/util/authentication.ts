import { Oso } from 'oso';
import {
  Account,
  Address,
  Application,
  Domain,
  Email,
  Feature,
  Files,
  Phone,
  RTW,
  Room,
  Status,
  Subscription,
  Transaction,
} from '@generated/type-graphql';
import { Context } from './helpers';
import { AuthCheckerInterface, ResolverData } from 'type-graphql';

export type Resource =
  | Account
  | Address
  | Application
  | Domain
  | Email
  | Feature
  | Files
  | Phone
  | RTW
  | Room
  | Status
  | Subscription
  | Transaction;

export class CustomAuthChecker implements AuthCheckerInterface<Context> {
  // inject dependency
  private oso: Oso;
  constructor(private readonly resource: Resource) {
    this.oso = new Oso();
    this.oso.registerClass(Account);
    this.oso.registerClass(Address);
    this.oso.registerClass(Application);
    this.oso.registerClass(Domain);
    this.oso.registerClass(Email);
    this.oso.registerClass(Feature);
    this.oso.registerClass(Files);
    this.oso.registerClass(Phone);
    this.oso.registerClass(RTW);
    this.oso.registerClass(Room);
    this.oso.registerClass(Status);
    this.oso.registerClass(Subscription);
    this.oso.registerClass(Transaction);
  }

  async check({ context, info }: ResolverData<Context>, _roles: string[]) {
    console.log('this ran');
    await this.oso.loadFiles(['../../policy.polar']);
    return await this.oso.isAllowed(
      context.user,
      info.operation.operation,
      this.resource
    );
  }
}
