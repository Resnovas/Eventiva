import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountUpdateInput } from "../../../inputs/SubscriptionOnAccountUpdateInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../../../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateSubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountUpdateInput, {
    nullable: false
  })
  data!: SubscriptionOnAccountUpdateInput;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionOnAccountWhereUniqueInput;
}
