import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateManySubscriptionInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateManySubscriptionInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

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
  deleted?: Date | undefined;
}
