import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionCreateInput } from "../../../inputs/SubscriptionCreateInput";
import { SubscriptionUpdateInput } from "../../../inputs/SubscriptionUpdateInput";
import { SubscriptionWhereUniqueInput } from "../../../inputs/SubscriptionWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertSubscriptionArgs {
  @TypeGraphQL.Field(_type => SubscriptionWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubscriptionCreateInput, {
    nullable: false
  })
  create!: SubscriptionCreateInput;

  @TypeGraphQL.Field(_type => SubscriptionUpdateInput, {
    nullable: false
  })
  update!: SubscriptionUpdateInput;
}
