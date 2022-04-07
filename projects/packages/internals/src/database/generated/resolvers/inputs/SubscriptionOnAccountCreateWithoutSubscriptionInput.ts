import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutSubscriptionInput } from "../inputs/AccountCreateNestedOneWithoutSubscriptionInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateWithoutSubscriptionInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateWithoutSubscriptionInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutSubscriptionInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutSubscriptionInput;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deactivated?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  activated?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startedAt?: Date | undefined;

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
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
