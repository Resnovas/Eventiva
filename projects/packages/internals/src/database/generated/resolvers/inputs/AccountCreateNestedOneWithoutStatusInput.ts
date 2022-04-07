import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutStatusInput } from "../inputs/AccountCreateOrConnectWithoutStatusInput";
import { AccountCreateWithoutStatusInput } from "../inputs/AccountCreateWithoutStatusInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateNestedOneWithoutStatusInput", {
  isAbstract: true
})
export class AccountCreateNestedOneWithoutStatusInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutStatusInput, {
    nullable: true
  })
  create?: AccountCreateWithoutStatusInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutStatusInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutStatusInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;
}
