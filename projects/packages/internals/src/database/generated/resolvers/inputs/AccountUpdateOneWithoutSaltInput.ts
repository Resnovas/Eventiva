import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutSaltInput } from "../inputs/AccountCreateOrConnectWithoutSaltInput";
import { AccountCreateWithoutSaltInput } from "../inputs/AccountCreateWithoutSaltInput";
import { AccountUpdateWithoutSaltInput } from "../inputs/AccountUpdateWithoutSaltInput";
import { AccountUpsertWithoutSaltInput } from "../inputs/AccountUpsertWithoutSaltInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneWithoutSaltInput", {
  isAbstract: true
})
export class AccountUpdateOneWithoutSaltInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutSaltInput, {
    nullable: true
  })
  create?: AccountCreateWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutSaltInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutSaltInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutSaltInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutSaltInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutSaltInput | undefined;
}
