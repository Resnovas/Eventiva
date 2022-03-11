import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutAccessesInput } from "../inputs/AccountCreateOrConnectWithoutAccessesInput";
import { AccountCreateWithoutAccessesInput } from "../inputs/AccountCreateWithoutAccessesInput";
import { AccountUpdateWithoutAccessesInput } from "../inputs/AccountUpdateWithoutAccessesInput";
import { AccountUpsertWithoutAccessesInput } from "../inputs/AccountUpsertWithoutAccessesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutAccessesInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutAccessesInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutAccessesInput, {
    nullable: true
  })
  create?: AccountCreateWithoutAccessesInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutAccessesInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutAccessesInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutAccessesInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutAccessesInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutAccessesInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutAccessesInput | undefined;
}
