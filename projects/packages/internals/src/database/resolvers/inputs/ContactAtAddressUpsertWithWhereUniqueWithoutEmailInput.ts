import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateWithoutEmailInput } from "../inputs/ContactAtAddressCreateWithoutEmailInput";
import { ContactAtAddressUpdateWithoutEmailInput } from "../inputs/ContactAtAddressUpdateWithoutEmailInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressUpdateWithoutEmailInput, {
    nullable: false
  })
  update!: ContactAtAddressUpdateWithoutEmailInput;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateWithoutEmailInput, {
    nullable: false
  })
  create!: ContactAtAddressCreateWithoutEmailInput;
}
