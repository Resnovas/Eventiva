import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIABadgeOrderByWithAggregationInput } from "../../../inputs/SIABadgeOrderByWithAggregationInput";
import { SIABadgeScalarWhereWithAggregatesInput } from "../../../inputs/SIABadgeScalarWhereWithAggregatesInput";
import { SIABadgeWhereInput } from "../../../inputs/SIABadgeWhereInput";
import { SIABadgeScalarFieldEnum } from "../../../../enums/SIABadgeScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupBySIABadgeArgs {
  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  where?: SIABadgeWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: SIABadgeOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "licenseSector" | "type" | "licenseExplanation" | "additionalTerms" | "createdAt" | "active" | "expiry" | "updatedAt" | "deleted" | "account_id">;

  @TypeGraphQL.Field(_type => SIABadgeScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: SIABadgeScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
