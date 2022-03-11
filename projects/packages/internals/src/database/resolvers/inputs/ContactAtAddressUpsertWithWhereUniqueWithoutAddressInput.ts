import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateWithoutAddressInput } from "../inputs/ContactAtAddressCreateWithoutAddressInput";
import { ContactAtAddressUpdateWithoutAddressInput } from "../inputs/ContactAtAddressUpdateWithoutAddressInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => ContactAtAddressWhereUniqueInput, {
    nullable: false
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => ContactAtAddressUpdateWithoutAddressInput, {
    nullable: false
  })
  update!: ContactAtAddressUpdateWithoutAddressInput;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateWithoutAddressInput, {
    nullable: false
  })
  create!: ContactAtAddressCreateWithoutAddressInput;
}
