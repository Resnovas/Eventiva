import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateOrConnectWithoutPhonesInput } from "../inputs/AddressCreateOrConnectWithoutPhonesInput";
import { AddressCreateWithoutPhonesInput } from "../inputs/AddressCreateWithoutPhonesInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressCreateNestedOneWithoutPhonesInput", {
  isAbstract: true
})
export class AddressCreateNestedOneWithoutPhonesInput {
  @TypeGraphQL.Field(_type => AddressCreateWithoutPhonesInput, {
    nullable: true
  })
  create?: AddressCreateWithoutPhonesInput | undefined;

  @TypeGraphQL.Field(_type => AddressCreateOrConnectWithoutPhonesInput, {
    nullable: true
  })
  connectOrCreate?: AddressCreateOrConnectWithoutPhonesInput | undefined;

  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: true
  })
  connect?: AddressWhereUniqueInput | undefined;
}
