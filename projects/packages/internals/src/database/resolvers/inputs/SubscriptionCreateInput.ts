import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput } from "../inputs/SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput";

@TypeGraphQL.InputType("SubscriptionCreateInput", {
  isAbstract: true
})
export class SubscriptionCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

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

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  name?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  cost?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details?: string | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput, {
    nullable: true
  })
  accounts?: SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput | undefined;
}
