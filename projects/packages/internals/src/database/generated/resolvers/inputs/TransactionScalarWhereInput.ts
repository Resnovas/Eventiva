import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { JsonFilter } from "../inputs/JsonFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("TransactionScalarWhereInput", {
  isAbstract: true
})
export class TransactionScalarWhereInput {
  @TypeGraphQL.Field(_type => [TransactionScalarWhereInput], {
    nullable: true
  })
  AND?: TransactionScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [TransactionScalarWhereInput], {
    nullable: true
  })
  OR?: TransactionScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [TransactionScalarWhereInput], {
    nullable: true
  })
  NOT?: TransactionScalarWhereInput[] | undefined;

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

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => JsonFilter, {
    nullable: true
  })
  data?: JsonFilter | undefined;
}
