import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateWithoutAddressInput } from "../inputs/ContactAtAddressCreateWithoutAddressInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressCreateOrConnectWithoutAddressInput", {
  isAbstract: true
})
export class ContactAtAddressCreateOrConnectWithoutAddressInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateWithoutAddressInput, {
    nullable: false
  })
  create!: ContactAtAddressCreateWithoutAddressInput;
}
