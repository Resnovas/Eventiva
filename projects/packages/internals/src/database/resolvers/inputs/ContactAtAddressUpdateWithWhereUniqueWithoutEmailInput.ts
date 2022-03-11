import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressUpdateWithoutEmailInput } from "../inputs/ContactAtAddressUpdateWithoutEmailInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressUpdateWithoutEmailInput, {
    nullable: false
  })
  data!: ContactAtAddressUpdateWithoutEmailInput;
}
