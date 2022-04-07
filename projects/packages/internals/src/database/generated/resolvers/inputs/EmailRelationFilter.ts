import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailWhereInput } from "../inputs/EmailWhereInput";

@TypeGraphQL.InputType("EmailRelationFilter", {
  isAbstract: true
})
export class EmailRelationFilter {
  @TypeGraphQL.Field(_type => EmailWhereInput, {
    nullable: true
  })
  is?: EmailWhereInput | undefined;

  @TypeGraphQL.Field(_type => EmailWhereInput, {
    nullable: true
  })
  isNot?: EmailWhereInput | undefined;
}
