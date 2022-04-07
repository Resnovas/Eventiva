import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateOrConnectWithoutContactsInput } from "../inputs/AddressCreateOrConnectWithoutContactsInput";
import { AddressCreateWithoutContactsInput } from "../inputs/AddressCreateWithoutContactsInput";
import { AddressUpdateWithoutContactsInput } from "../inputs/AddressUpdateWithoutContactsInput";
import { AddressUpsertWithoutContactsInput } from "../inputs/AddressUpsertWithoutContactsInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressUpdateOneRequiredWithoutContactsInput", {
  isAbstract: true
})
export class AddressUpdateOneRequiredWithoutContactsInput {
  @TypeGraphQL.Field(_type => AddressCreateWithoutContactsInput, {
    nullable: true
  })
  create?: AddressCreateWithoutContactsInput | undefined;

  @TypeGraphQL.Field(_type => AddressCreateOrConnectWithoutContactsInput, {
    nullable: true
  })
  connectOrCreate?: AddressCreateOrConnectWithoutContactsInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpsertWithoutContactsInput, {
    nullable: true
  })
  upsert?: AddressUpsertWithoutContactsInput | undefined;

  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: true
  })
  connect?: AddressWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpdateWithoutContactsInput, {
    nullable: true
  })
  update?: AddressUpdateWithoutContactsInput | undefined;
}
