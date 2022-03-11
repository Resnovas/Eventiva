import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutSubscriptionInput } from "../inputs/AccountCreateOrConnectWithoutSubscriptionInput";
import { AccountCreateWithoutSubscriptionInput } from "../inputs/AccountCreateWithoutSubscriptionInput";
import { AccountUpdateWithoutSubscriptionInput } from "../inputs/AccountUpdateWithoutSubscriptionInput";
import { AccountUpsertWithoutSubscriptionInput } from "../inputs/AccountUpsertWithoutSubscriptionInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutSubscriptionInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutSubscriptionInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutSubscriptionInput, {
    nullable: true
  })
  create?: AccountCreateWithoutSubscriptionInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutSubscriptionInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutSubscriptionInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutSubscriptionInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutSubscriptionInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutSubscriptionInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutSubscriptionInput | undefined;
}
