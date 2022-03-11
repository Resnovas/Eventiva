import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressAccountIdAddressIdCompoundUniqueInput } from "../inputs/ContactAtAddressAccountIdAddressIdCompoundUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressWhereUniqueInput", {
  isAbstract: true
})
export class ContactAtAddressWhereUniqueInput {
  @TypeGraphQL.Field(_type => ContactAtAddressAccountIdAddressIdCompoundUniqueInput, {
    nullable: true
  })
  accountId_addressId?: ContactAtAddressAccountIdAddressIdCompoundUniqueInput | undefined;
}
