import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutApplicationInput } from "../inputs/AccountCreateOrConnectWithoutApplicationInput";
import { AccountCreateWithoutApplicationInput } from "../inputs/AccountCreateWithoutApplicationInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutApplicationInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutApplicationInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutApplicationInput, {
    nullable: true
  })
  create?: AccountCreateWithoutApplicationInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutApplicationInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutApplicationInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
