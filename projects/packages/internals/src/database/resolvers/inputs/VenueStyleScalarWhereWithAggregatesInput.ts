import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringNullableWithAggregatesFilter } from "../inputs/StringNullableWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("VenueStyleScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class VenueStyleScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: VenueStyleScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: VenueStyleScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: VenueStyleScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  details?: StringNullableWithAggregatesFilter | undefined;
}
