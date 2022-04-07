import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AddressOrderByWithAggregationInput } from "../../../inputs/AddressOrderByWithAggregationInput";
import { AddressScalarWhereWithAggregatesInput } from "../../../inputs/AddressScalarWhereWithAggregatesInput";
import { AddressWhereInput } from "../../../inputs/AddressWhereInput";
import { AddressScalarFieldEnum } from "../../../../enums/AddressScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByAddressArgs {
  @TypeGraphQL.Field(_type => AddressWhereInput, {
    nullable: true
  })
  where?: AddressWhereInput | undefined;

  @TypeGraphQL.Field(_type => [AddressOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: AddressOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "createdAt" | "updatedAt" | "accountId" | "type" | "coords" | "street" | "city" | "state" | "country" | "zipcode" | "addressName" | "name" | "parking" | "website" | "hoursOfOperation" | "features" | "details" | "public" | "primaryaccountId" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => AddressScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: AddressScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
