import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DomainWhereInput } from "../inputs/DomainWhereInput";

@TypeGraphQL.InputType("DomainRelationFilter", {
  isAbstract: true
})
export class DomainRelationFilter {
  @TypeGraphQL.Field(_type => DomainWhereInput, {
    nullable: true
  })
  is?: DomainWhereInput | undefined;

  @TypeGraphQL.Field(_type => DomainWhereInput, {
    nullable: true
  })
  isNot?: DomainWhereInput | undefined;
}
