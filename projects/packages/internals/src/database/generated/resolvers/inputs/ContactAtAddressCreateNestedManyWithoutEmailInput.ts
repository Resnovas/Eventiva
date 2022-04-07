import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateManyEmailInputEnvelope } from "../inputs/ContactAtAddressCreateManyEmailInputEnvelope";
import { ContactAtAddressCreateOrConnectWithoutEmailInput } from "../inputs/ContactAtAddressCreateOrConnectWithoutEmailInput";
import { ContactAtAddressCreateWithoutEmailInput } from "../inputs/ContactAtAddressCreateWithoutEmailInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressCreateNestedManyWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressCreateNestedManyWithoutEmailInput {
  @TypeGraphQL.Field(_type => [ContactAtAddressCreateWithoutEmailInput], {
    nullable: true
  })
  create?: ContactAtAddressCreateWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressCreateOrConnectWithoutEmailInput], {
    nullable: true
  })
  connectOrCreate?: ContactAtAddressCreateOrConnectWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateManyEmailInputEnvelope, {
    nullable: true
  })
  createMany?: ContactAtAddressCreateManyEmailInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  connect?: ContactAtAddressWhereUniqueInput[] | undefined;
}
