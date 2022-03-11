import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneScalarWhereInput } from "../inputs/PhoneScalarWhereInput";
import { PhoneUpdateManyMutationInput } from "../inputs/PhoneUpdateManyMutationInput";

@TypeGraphQL.InputType("PhoneUpdateManyWithWhereWithoutAddressInput", {
  isAbstract: true
})
export class PhoneUpdateManyWithWhereWithoutAddressInput {
  @TypeGraphQL.Field(_type => PhoneScalarWhereInput, {
    nullable: false
  })
  where!: PhoneScalarWhereInput;

  @TypeGraphQL.Field(_type => PhoneUpdateManyMutationInput, {
    nullable: false
  })
  data!: PhoneUpdateManyMutationInput;
}
