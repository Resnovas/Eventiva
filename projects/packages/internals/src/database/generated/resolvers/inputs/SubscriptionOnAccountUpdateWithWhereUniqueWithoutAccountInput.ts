import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountUpdateWithoutAccountInput } from "../inputs/SubscriptionOnAccountUpdateWithoutAccountInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: SubscriptionOnAccountUpdateWithoutAccountInput;
}
