import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("VenueStyleScalarWhereInput", {
  isAbstract: true
})
export class VenueStyleScalarWhereInput {
  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereInput], {
    nullable: true
  })
  AND?: VenueStyleScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereInput], {
    nullable: true
  })
  OR?: VenueStyleScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarWhereInput], {
    nullable: true
  })
  NOT?: VenueStyleScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  details?: StringNullableFilter | undefined;
}
