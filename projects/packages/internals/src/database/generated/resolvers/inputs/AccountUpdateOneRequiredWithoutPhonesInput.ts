import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutPhonesInput } from "../inputs/AccountCreateOrConnectWithoutPhonesInput";
import { AccountCreateWithoutPhonesInput } from "../inputs/AccountCreateWithoutPhonesInput";
import { AccountUpdateWithoutPhonesInput } from "../inputs/AccountUpdateWithoutPhonesInput";
import { AccountUpsertWithoutPhonesInput } from "../inputs/AccountUpsertWithoutPhonesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneRequiredWithoutPhonesInput", {
  isAbstract: true
})
export class AccountUpdateOneRequiredWithoutPhonesInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutPhonesInput, {
    nullable: true
  })
  create?: AccountCreateWithoutPhonesInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutPhonesInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutPhonesInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutPhonesInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutPhonesInput | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  connect?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutPhonesInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutPhonesInput | undefined;
}
