import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutContactOfAddressInput } from "../inputs/AccountCreateOrConnectWithoutContactOfAddressInput";
import { AccountCreateWithoutContactOfAddressInput } from "../inputs/AccountCreateWithoutContactOfAddressInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutContactOfAddressInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutContactOfAddressInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutContactOfAddressInput, {
    nullable: true
  })
  create?: AccountCreateWithoutContactOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutContactOfAddressInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutContactOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
