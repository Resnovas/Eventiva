import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput";
import { SubscriptionOnAccountWhereInput } from "../../../inputs/SubscriptionOnAccountWhereInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../../../inputs/SubscriptionOnAccountWhereUniqueInput";
import { SubscriptionOnAccountScalarFieldEnum } from "../../../../enums/SubscriptionOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstSubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereInput, {
    nullable: true
  })
  where?: SubscriptionOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: SubscriptionOnAccountOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: true
  })
  cursor?: SubscriptionOnAccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"subscriptionId" | "accountId" | "active" | "deactivated" | "activated" | "startedAt" | "createdAt" | "updatedAt" | "deletedDate" | "deleted"> | undefined;
}
