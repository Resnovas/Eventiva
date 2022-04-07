import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutEmployeesInput } from "../inputs/AccountCreateOrConnectWithoutEmployeesInput";
import { AccountCreateWithoutEmployeesInput } from "../inputs/AccountCreateWithoutEmployeesInput";
import { AccountUpdateWithoutEmployeesInput } from "../inputs/AccountUpdateWithoutEmployeesInput";
import { AccountUpsertWithoutEmployeesInput } from "../inputs/AccountUpsertWithoutEmployeesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutEmployeesInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutEmployeesInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutEmployeesInput, {
    nullable: true
  })
  create?: AccountCreateWithoutEmployeesInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutEmployeesInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutEmployeesInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutEmployeesInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutEmployeesInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutEmployeesInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutEmployeesInput | undefined;
}
