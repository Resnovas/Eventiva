import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateManyAccountInputEnvelope } from "../inputs/ContactAtAddressCreateManyAccountInputEnvelope";
import { ContactAtAddressCreateOrConnectWithoutAccountInput } from "../inputs/ContactAtAddressCreateOrConnectWithoutAccountInput";
import { ContactAtAddressCreateWithoutAccountInput } from "../inputs/ContactAtAddressCreateWithoutAccountInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class ContactAtAddressCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [ContactAtAddressCreateWithoutAccountInput], {
    nullable: true
  })
  create?: ContactAtAddressCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: ContactAtAddressCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: ContactAtAddressCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  connect?: ContactAtAddressWhereUniqueInput[] | undefined;
}
