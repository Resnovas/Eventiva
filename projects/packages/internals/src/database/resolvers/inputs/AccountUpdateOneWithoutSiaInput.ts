import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutSiaInput } from "../inputs/AccountCreateOrConnectWithoutSiaInput";
import { AccountCreateWithoutSiaInput } from "../inputs/AccountCreateWithoutSiaInput";
import { AccountUpdateWithoutSiaInput } from "../inputs/AccountUpdateWithoutSiaInput";
import { AccountUpsertWithoutSiaInput } from "../inputs/AccountUpsertWithoutSiaInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneWithoutSiaInput", {
  isAbstract: true
})
export class AccountUpdateOneWithoutSiaInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutSiaInput, {
    nullable: true
  })
  create?: AccountCreateWithoutSiaInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutSiaInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSiaInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutSiaInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutSiaInput | undefined;

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

  @TypeGraphQL.Field(_type => AccountUpdateWithoutSiaInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutSiaInput | undefined;
}
