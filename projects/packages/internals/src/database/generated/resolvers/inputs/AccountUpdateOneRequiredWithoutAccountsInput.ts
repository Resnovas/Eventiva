import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutAccountsInput } from "../inputs/AccountCreateOrConnectWithoutAccountsInput";
import { AccountCreateWithoutAccountsInput } from "../inputs/AccountCreateWithoutAccountsInput";
import { AccountUpdateWithoutAccountsInput } from "../inputs/AccountUpdateWithoutAccountsInput";
import { AccountUpsertWithoutAccountsInput } from "../inputs/AccountUpsertWithoutAccountsInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutAccountsInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutAccountsInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutAccountsInput, {
    nullable: true
  })
  create?: AccountCreateWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutAccountsInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutAccountsInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutAccountsInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutAccountsInput | undefined;
}
