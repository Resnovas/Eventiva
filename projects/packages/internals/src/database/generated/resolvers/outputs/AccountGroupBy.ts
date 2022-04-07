import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountAvgAggregate } from "../outputs/AccountAvgAggregate";
import { AccountCountAggregate } from "../outputs/AccountCountAggregate";
import { AccountMaxAggregate } from "../outputs/AccountMaxAggregate";
import { AccountMinAggregate } from "../outputs/AccountMinAggregate";
import { AccountSumAggregate } from "../outputs/AccountSumAggregate";
import { AccountType } from "../../enums/AccountType";
import { Title } from "../../enums/Title";

@TypeGraphQL.ObjectType("AccountGroupBy", {
  isAbstract: true
})
export class AccountGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  prn!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  username!: string | null;

  @TypeGraphQL.Field(_type => AccountType, {
    nullable: false
  })
  accountType!: "USER" | "BUSINESS" | "PROVIDER";

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  subsciption!: boolean;

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
  lastLogin!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  applied!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  promoted!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  retired!: Date | null;

  @TypeGraphQL.Field(_type => Title, {
    nullable: true
  })
  title!: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  firstname!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  midname!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  lastname!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  Salutation!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  dob!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  sex!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  label!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  password!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  resetPasswordToken!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  resetPasswordExpires!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

  @TypeGraphQL.Field(_type => AccountCountAggregate, {
    nullable: true
  })
  _count!: AccountCountAggregate | null;

  @TypeGraphQL.Field(_type => AccountAvgAggregate, {
    nullable: true
  })
  _avg!: AccountAvgAggregate | null;

  @TypeGraphQL.Field(_type => AccountSumAggregate, {
    nullable: true
  })
  _sum!: AccountSumAggregate | null;

  @TypeGraphQL.Field(_type => AccountMinAggregate, {
    nullable: true
  })
  _min!: AccountMinAggregate | null;

  @TypeGraphQL.Field(_type => AccountMaxAggregate, {
    nullable: true
  })
  _max!: AccountMaxAggregate | null;
}
