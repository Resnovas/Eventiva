import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { JsonNullableFilter } from "../inputs/JsonNullableFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("FeatureOfAddressScalarWhereInput", {
  isAbstract: true
})
export class FeatureOfAddressScalarWhereInput {
  @TypeGraphQL.Field(_type => [FeatureOfAddressScalarWhereInput], {
    nullable: true
  })
  AND?: FeatureOfAddressScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressScalarWhereInput], {
    nullable: true
  })
  OR?: FeatureOfAddressScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressScalarWhereInput], {
    nullable: true
  })
  NOT?: FeatureOfAddressScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  addressId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  featureId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  data?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deleted?: DateTimeNullableFilter | undefined;
}
