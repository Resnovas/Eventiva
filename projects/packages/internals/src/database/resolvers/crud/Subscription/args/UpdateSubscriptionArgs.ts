import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionUpdateInput } from "../../../inputs/SubscriptionUpdateInput";
import { SubscriptionWhereUniqueInput } from "../../../inputs/SubscriptionWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateSubscriptionArgs {
  @TypeGraphQL.Field(_type => SubscriptionUpdateInput, {
    nullable: false
  })
  data!: SubscriptionUpdateInput;

  @TypeGraphQL.Field(_type => SubscriptionWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionWhereUniqueInput;
}
