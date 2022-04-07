import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableWithAggregatesFilter } from "../inputs/BoolNullableWithAggregatesFilter";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { EnumFeatureTypeWithAggregatesFilter } from "../inputs/EnumFeatureTypeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("FeatureScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class FeatureScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [FeatureScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: FeatureScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: FeatureScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [FeatureScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: FeatureScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => EnumFeatureTypeWithAggregatesFilter, {
    nullable: true
  })
  type?: EnumFeatureTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableWithAggregatesFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableWithAggregatesFilter, {
    nullable: true
  })
  deleted?: BoolNullableWithAggregatesFilter | undefined;
}
