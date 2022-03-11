import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressUpdateWithoutAccountInput } from "../inputs/AddressUpdateWithoutAccountInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressUpdateWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class AddressUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => AddressUpdateWithoutAccountInput, {
    nullable: false
  })
  data!: AddressUpdateWithoutAccountInput;
}
