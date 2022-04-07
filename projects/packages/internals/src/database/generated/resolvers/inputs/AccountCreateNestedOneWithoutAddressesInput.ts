import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutAddressesInput } from "../inputs/AccountCreateOrConnectWithoutAddressesInput";
import { AccountCreateWithoutAddressesInput } from "../inputs/AccountCreateWithoutAddressesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutAddressesInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutAddressesInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutAddressesInput, {
    nullable: true
  })
  create?: AccountCreateWithoutAddressesInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutAddressesInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAddressesInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
