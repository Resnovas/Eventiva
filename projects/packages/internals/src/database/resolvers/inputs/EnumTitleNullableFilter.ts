import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumTitleNullableFilter } from "../inputs/NestedEnumTitleNullableFilter";
import { Title } from "../../enums/Title";

@TypeGraphQL.InputType("EnumTitleNullableFilter", {
  isAbstract: true
})
export class EnumTitleNullableFilter {
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

  @TypeGraphQL.Field(_type => NestedEnumTitleNullableFilter, {
    nullable: true
  })
  not?: NestedEnumTitleNullableFilter | undefined;
}
