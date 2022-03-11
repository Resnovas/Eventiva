import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressRelationFilter } from "../inputs/AddressRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { FeatureRelationFilter } from "../inputs/FeatureRelationFilter";
import { JsonNullableFilter } from "../inputs/JsonNullableFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("FeatureOfAddressWhereInput", {
  isAbstract: true
})
export class FeatureOfAddressWhereInput {
  @TypeGraphQL.Field(_type => [FeatureOfAddressWhereInput], {
    nullable: true
  })
  AND?: FeatureOfAddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressWhereInput], {
    nullable: true
  })
  OR?: FeatureOfAddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfAddressWhereInput], {
    nullable: true
  })
  NOT?: FeatureOfAddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  addressId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  featureId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => FeatureRelationFilter, {
    nullable: true
  })
  feature?: FeatureRelationFilter | undefined;

  @TypeGraphQL.Field(_type => AddressRelationFilter, {
    nullable: true
  })
  address?: AddressRelationFilter | undefined;

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
