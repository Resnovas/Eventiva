import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutPrimaryAddressInput } from "../inputs/AccountCreateOrConnectWithoutPrimaryAddressInput";
import { AccountCreateWithoutPrimaryAddressInput } from "../inputs/AccountCreateWithoutPrimaryAddressInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutPrimaryAddressInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutPrimaryAddressInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutPrimaryAddressInput, {
    nullable: true
  })
  create?: AccountCreateWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutPrimaryAddressInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutPrimaryAddressInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
