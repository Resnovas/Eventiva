import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutSaltInput } from "../inputs/AccountCreateOrConnectWithoutSaltInput";
import { AccountCreateWithoutSaltInput } from "../inputs/AccountCreateWithoutSaltInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutSaltInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutSaltInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutSaltInput, {
    nullable: true
  })
  create?: AccountCreateWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutSaltInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
