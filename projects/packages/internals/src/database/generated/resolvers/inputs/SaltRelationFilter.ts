import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SaltWhereInput } from "../inputs/SaltWhereInput";

@TypeGraphQL.InputType("SaltRelationFilter", {
  isAbstract: true
})
export class SaltRelationFilter {
  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  is?: SaltWhereInput | undefined;

  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  isNot?: SaltWhereInput | undefined;
}
