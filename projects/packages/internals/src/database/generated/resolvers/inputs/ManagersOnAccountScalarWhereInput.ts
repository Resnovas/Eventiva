import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("ManagersOnAccountScalarWhereInput", {
  isAbstract: true
})
export class ManagersOnAccountScalarWhereInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereInput], {
    nullable: true
  })
  AND?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereInput], {
    nullable: true
  })
  OR?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereInput], {
    nullable: true
  })
  NOT?: ManagersOnAccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  managersId?: StringFilter | undefined;

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
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;
}
