import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { Files } from "../models/Files";
import { RTWCount } from "../resolvers/outputs/RTWCount";

@TypeGraphQL.ObjectType("RTW", {
  isAbstract: true
})
export class RTW {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  files?: Files[];

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active?: boolean | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startDate?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  endDate?: Date | null;

  account?: Account;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

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
  deleted?: Date | null;

  @TypeGraphQL.Field(_type => RTWCount, {
    nullable: true
  })
  _count?: RTWCount | null;
}
