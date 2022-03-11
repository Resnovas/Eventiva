import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("ManagersOnAccountWhereInput", {
  isAbstract: true
})
export class ManagersOnAccountWhereInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountWhereInput], {
    nullable: true
  })
  AND?: ManagersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountWhereInput], {
    nullable: true
  })
  OR?: ManagersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountWhereInput], {
    nullable: true
  })
  NOT?: ManagersOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  managersId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  managers?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;
}
