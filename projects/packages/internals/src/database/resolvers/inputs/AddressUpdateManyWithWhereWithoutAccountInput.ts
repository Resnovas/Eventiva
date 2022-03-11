import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressScalarWhereInput } from "../inputs/AddressScalarWhereInput";
import { AddressUpdateManyMutationInput } from "../inputs/AddressUpdateManyMutationInput";

@TypeGraphQL.InputType("AddressUpdateManyWithWhereWithoutAccountInput", {
  isAbstract: true
})
export class AddressUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field(_type => AddressScalarWhereInput, {
    nullable: false
  })
  where!: AddressScalarWhereInput;

  @TypeGraphQL.Field(_type => AddressUpdateManyMutationInput, {
    nullable: false
  })
  data!: AddressUpdateManyMutationInput;
}
