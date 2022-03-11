import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateWithoutAccountInput } from "../inputs/AddressCreateWithoutAccountInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class AddressCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => AddressWhereUniqueInput, {
    nullable: false
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => AddressCreateWithoutAccountInput, {
    nullable: false
  })
  create!: AddressCreateWithoutAccountInput;
}
