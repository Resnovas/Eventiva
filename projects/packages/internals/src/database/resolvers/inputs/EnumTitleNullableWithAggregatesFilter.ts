import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumTitleNullableFilter } from "../inputs/NestedEnumTitleNullableFilter";
import { NestedEnumTitleNullableWithAggregatesFilter } from "../inputs/NestedEnumTitleNullableWithAggregatesFilter";
import { NestedIntNullableFilter } from "../inputs/NestedIntNullableFilter";
import { Title } from "../../enums/Title";

@TypeGraphQL.InputType("EnumTitleNullableWithAggregatesFilter", {
  isAbstract: true
})
export class EnumTitleNullableWithAggregatesFilter {
  @TypeGraphQL.Field(_type => Title, {
    nullable: true
  })
  equals?: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | undefined;

  @TypeGraphQL.Field(_type => [Title], {
    nullable: true
  })
  in?: Array<"Miss" | "Ms" | "Mrs" | "Mr" | "Dr"> | undefined;

  @TypeGraphQL.Field(_type => [Title], {
    nullable: true
  })
  notIn?: Array<"Miss" | "Ms" | "Mrs" | "Mr" | "Dr"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumTitleNullableWithAggregatesFilter, {
    nullable: true
  })
  not?: NestedEnumTitleNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => NestedIntNullableFilter, {
    nullable: true
  })
  _count?: NestedIntNullableFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumTitleNullableFilter, {
    nullable: true
  })
  _min?: NestedEnumTitleNullableFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumTitleNullableFilter, {
    nullable: true
  })
  _max?: NestedEnumTitleNullableFilter | undefined;
}
