import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateWithoutContactsInput } from "../inputs/AddressCreateWithoutContactsInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressCreateOrConnectWithoutContactsInput", {
  isAbstract: true
})
export class AddressCreateOrConnectWithoutContactsInput {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => AddressCreateWithoutContactsInput, {
    nullable: false
  })
  create!: AddressCreateWithoutContactsInput;
}
