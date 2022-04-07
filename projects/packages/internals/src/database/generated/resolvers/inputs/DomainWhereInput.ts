import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolFilter } from "../inputs/BoolFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EmailListRelationFilter } from "../inputs/EmailListRelationFilter";
import { EnumdnsTypeFilter } from "../inputs/EnumdnsTypeFilter";
import { JsonFilter } from "../inputs/JsonFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("DomainWhereInput", {
  isAbstract: true
})
export class DomainWhereInput {
  @TypeGraphQL.Field(_type => [DomainWhereInput], {
    nullable: true
  })
  AND?: DomainWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [DomainWhereInput], {
    nullable: true
  })
  OR?: DomainWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [DomainWhereInput], {
    nullable: true
  })
  NOT?: DomainWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  domain?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => BoolFilter, {
    nullable: true
  })
  verified?: BoolFilter | undefined;

  @TypeGraphQL.Field(_type => EnumdnsTypeFilter, {
    nullable: true
  })
  dnsType?: EnumdnsTypeFilter | undefined;

  @TypeGraphQL.Field(_type => EmailListRelationFilter, {
    nullable: true
  })
  linkedEmails?: EmailListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => JsonFilter, {
    nullable: true
  })
  data?: JsonFilter | undefined;

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
