import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountOrderByWithAggregationInput } from "../../../inputs/SubscriptionOnAccountOrderByWithAggregationInput";
import { SubscriptionOnAccountScalarWhereWithAggregatesInput } from "../../../inputs/SubscriptionOnAccountScalarWhereWithAggregatesInput";
import { SubscriptionOnAccountWhereInput } from "../../../inputs/SubscriptionOnAccountWhereInput";
import { SubscriptionOnAccountScalarFieldEnum } from "../../../../enums/SubscriptionOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupBySubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereInput, {
    nullable: true
  })
  where?: SubscriptionOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: SubscriptionOnAccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"subscriptionId" | "accountId" | "active" | "deactivated" | "activated" | "startedAt" | "createdAt" | "updatedAt" | "deleted">;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: SubscriptionOnAccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
