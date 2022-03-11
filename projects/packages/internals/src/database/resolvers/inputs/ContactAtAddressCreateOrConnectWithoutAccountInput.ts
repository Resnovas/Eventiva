import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateWithoutAccountInput } from "../inputs/ContactAtAddressCreateWithoutAccountInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class ContactAtAddressCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateWithoutAccountInput, {
    nullable: false
  })
  create!: ContactAtAddressCreateWithoutAccountInput;
}
