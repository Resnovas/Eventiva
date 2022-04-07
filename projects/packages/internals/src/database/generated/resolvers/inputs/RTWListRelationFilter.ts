import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWWhereInput } from "../inputs/RTWWhereInput";

@TypeGraphQL.InputType("RTWListRelationFilter", {
  isAbstract: true
})
export class RTWListRelationFilter {
  @TypeGraphQL.Field(_type => RTWWhereInput, {
    nullable: true
  })
  every?: RTWWhereInput | undefined;

  @TypeGraphQL.Field(_type => RTWWhereInput, {
    nullable: true
  })
  some?: RTWWhereInput | undefined;

  @TypeGraphQL.Field(_type => RTWWhereInput, {
    nullable: true
  })
  none?: RTWWhereInput | undefined;
}
