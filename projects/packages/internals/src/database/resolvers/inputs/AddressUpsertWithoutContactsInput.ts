import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateWithoutContactsInput } from "../inputs/AddressCreateWithoutContactsInput";
import { AddressUpdateWithoutContactsInput } from "../inputs/AddressUpdateWithoutContactsInput";

@TypeGraphQL.InputType("AddressUpsertWithoutContactsInput", {
  isAbstract: true
})
export class AddressUpsertWithoutContactsInput {
  @TypeGraphQL.Field(_type => AddressUpdateWithoutContactsInput, {
    nullable: false
  })
  update!: AddressUpdateWithoutContactsInput;

  @TypeGraphQL.Field(_type => AddressCreateWithoutContactsInput, {
    nullable: false
  })
  create!: AddressCreateWithoutContactsInput;
}
