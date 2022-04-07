import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateOrConnectWithoutEmailsInput } from "../inputs/AccountCreateOrConnectWithoutEmailsInput";
import { AccountCreateWithoutEmailsInput } from "../inputs/AccountCreateWithoutEmailsInput";
import { AccountUpdateWithoutEmailsInput } from "../inputs/AccountUpdateWithoutEmailsInput";
import { AccountUpsertWithoutEmailsInput } from "../inputs/AccountUpsertWithoutEmailsInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateOneWithoutEmailsInput", {
  isAbstract: true
})
export class AccountUpdateOneWithoutEmailsInput {
  @TypeGraphQL.Field(_type => AccountCreateWithoutEmailsInput, {
    nullable: true
  })
  create?: AccountCreateWithoutEmailsInput | undefined;

  @TypeGraphQL.Field(_type => AccountCreateOrConnectWithoutEmailsInput, {
    nullable: true
  })
  connectOrCreate?: AccountCreateOrConnectWithoutEmailsInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpsertWithoutEmailsInput, {
    nullable: true
  })
  upsert?: AccountUpsertWithoutEmailsInput | undefined;

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

  @TypeGraphQL.Field(_type => AccountUpdateWithoutEmailsInput, {
    nullable: true
  })
  update?: AccountUpdateWithoutEmailsInput | undefined;
}
