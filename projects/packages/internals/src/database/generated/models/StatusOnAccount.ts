import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { Status } from "../models/Status";

@TypeGraphQL.ObjectType("StatusOnAccount", {
  isAbstract: true
})
export class StatusOnAccount {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  statusId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  status?: Status;

  account?: Account;

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
