import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateWithoutEmailInput } from "../inputs/ContactAtAddressCreateWithoutEmailInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressCreateOrConnectWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressCreateOrConnectWithoutEmailInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateWithoutEmailInput, {
    nullable: false
  })
  create!: ContactAtAddressCreateWithoutEmailInput;
}
