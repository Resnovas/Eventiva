import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutSubusersInput } from "../inputs/AccountCreateOrConnectWithoutSubusersInput";
import { AccountCreateWithoutSubusersInput } from "../inputs/AccountCreateWithoutSubusersInput";
import { AccountUpdateWithoutSubusersInput } from "../inputs/AccountUpdateWithoutSubusersInput";
import { AccountUpsertWithoutSubusersInput } from "../inputs/AccountUpsertWithoutSubusersInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutSubusersInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutSubusersInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutSubusersInput, {
    nullable: true
  })
  create?: AccountCreateWithoutSubusersInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutSubusersInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSubusersInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutSubusersInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutSubusersInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutSubusersInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutSubusersInput | undefined;
}
