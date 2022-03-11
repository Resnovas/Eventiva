import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("SubuserOnAccountScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class SubuserOnAccountScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [SubuserOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: SubuserOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: SubuserOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: SubuserOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  subuserId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;
}
