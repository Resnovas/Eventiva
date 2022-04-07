import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutEmployerInput } from "../inputs/AccountCreateOrConnectWithoutEmployerInput";
import { AccountCreateWithoutEmployerInput } from "../inputs/AccountCreateWithoutEmployerInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutEmployerInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutEmployerInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutEmployerInput, {
    nullable: true
  })
  create?: AccountCreateWithoutEmployerInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutEmployerInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutEmployerInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
