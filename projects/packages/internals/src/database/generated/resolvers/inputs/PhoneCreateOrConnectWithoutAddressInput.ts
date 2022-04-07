import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateWithoutAddressInput } from "../inputs/PhoneCreateWithoutAddressInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneCreateOrConnectWithoutAddressInput", {
  isAbstract: true
})
export class PhoneCreateOrConnectWithoutAddressInput {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field(_type => PhoneCreateWithoutAddressInput, {
    nullable: false
  })
  create!: PhoneCreateWithoutAddressInput;
}
