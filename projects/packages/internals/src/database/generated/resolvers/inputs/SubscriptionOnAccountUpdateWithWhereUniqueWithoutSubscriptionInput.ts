import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountUpdateWithoutSubscriptionInput } from "../inputs/SubscriptionOnAccountUpdateWithoutSubscriptionInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput", {
  isAbstract: true
})
export class SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountUpdateWithoutSubscriptionInput, {
    nullable: false
  })
  data!: SubscriptionOnAccountUpdateWithoutSubscriptionInput;
}
