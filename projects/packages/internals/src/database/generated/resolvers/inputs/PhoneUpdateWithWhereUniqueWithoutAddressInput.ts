import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneUpdateWithoutAddressInput } from "../inputs/PhoneUpdateWithoutAddressInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneUpdateWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class PhoneUpdateWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => PhoneWhereUniqueInput, {
    nullable: false
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field(_type => PhoneUpdateWithoutAddressInput, {
    nullable: false
  })
  data!: PhoneUpdateWithoutAddressInput;
}
