import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("SaltWhereInput", {
  isAbstract: true
})
export class SaltWhereInput {
  @TypeGraphQL.Field(_type => [SaltWhereInput], {
    nullable: true
  })
  AND?: SaltWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SaltWhereInput], {
    nullable: true
  })
  OR?: SaltWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SaltWhereInput], {
    nullable: true
  })
  NOT?: SaltWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  salt?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  expiry?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  accountID?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;
}
