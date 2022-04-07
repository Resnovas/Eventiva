import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { Subscription } from "../models/Subscription";

@TypeGraphQL.ObjectType("SubscriptionOnAccount", {
  isAbstract: true
})
export class SubscriptionOnAccount {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  subscriptionId!: string;

  subscription?: Subscription;

  account?: Account;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  active!: boolean;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deactivated?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  activated?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startedAt?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | null;
}
