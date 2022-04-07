import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfAddressOrderByWithAggregationInput } from "../../../inputs/FeatureOfAddressOrderByWithAggregationInput";
import { FeatureOfAddressScalarWhereWithAggregatesInput } from "../../../inputs/FeatureOfAddressScalarWhereWithAggregatesInput";
import { FeatureOfAddressWhereInput } from "../../../inputs/FeatureOfAddressWhereInput";
import { FeatureOfAddressScalarFieldEnum } from "../../../../enums/FeatureOfAddressScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByFeatureOfAddressArgs {
  @TypeGraphQL.Field(_type => FeatureOfAddressWhereInput, {
    nullable: true
  })
  where?: FeatureOfAddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: FeatureOfAddressOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"addressId" | "featureId" | "data" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => FeatureOfAddressScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: FeatureOfAddressScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
