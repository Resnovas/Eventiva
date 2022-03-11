import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneWhereInput } from "../inputs/PhoneWhereInput";

@TypeGraphQL.InputType("PhoneListRelationFilter", {
  isAbstract: true
})
export class PhoneListRelationFilter {
  @TypeGraphQL.Field(_type => PhoneWhereInput, {
    nullable: true
  })
  every?: PhoneWhereInput | undefined;

  @TypeGraphQL.Field(_type => PhoneWhereInput, {
    nullable: true
  })
  some?: PhoneWhereInput | undefined;

  @TypeGraphQL.Field(_type => PhoneWhereInput, {
    nullable: true
  })
  none?: PhoneWhereInput | undefined;
}
