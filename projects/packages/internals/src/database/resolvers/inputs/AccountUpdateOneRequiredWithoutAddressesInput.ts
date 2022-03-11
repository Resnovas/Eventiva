import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutAddressesInput } from "../inputs/AccountCreateOrConnectWithoutAddressesInput";
import { AccountCreateWithoutAddressesInput } from "../inputs/AccountCreateWithoutAddressesInput";
import { AccountUpdateWithoutAddressesInput } from "../inputs/AccountUpdateWithoutAddressesInput";
import { AccountUpsertWithoutAddressesInput } from "../inputs/AccountUpsertWithoutAddressesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutAddressesInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutAddressesInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutAddressesInput, {
    nullable: true
  })
  create?: AccountCreateWithoutAddressesInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutAddressesInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAddressesInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutAddressesInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutAddressesInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutAddressesInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutAddressesInput | undefined;
}
