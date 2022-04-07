import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountType } from "../../enums/AccountType";
import { Title } from "../../enums/Title";

@TypeGraphQL.InputType("AccountCreateManyInput", {
  isAbstract: true
})
export class AccountCreateManyInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  prn?: number | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  username?: string | undefined;

  @TypeGraphQL.Field(_type => AccountType, {
    nullable: true
  })
  accountType?: "USER" | "BUSINESS" | "PROVIDER" | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  subsciption?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  lastLogin?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  applied?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  promoted?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  retired?: Date | undefined;

  @TypeGraphQL.Field(_type => Title, {
    nullable: true
  })
  title?: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  firstname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  midname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  lastname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  Salutation?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  dob?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  sex?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  label!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  password?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  resetPasswordToken?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  resetPasswordExpires?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
