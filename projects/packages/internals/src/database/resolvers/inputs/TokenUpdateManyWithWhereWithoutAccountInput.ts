import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenScalarWhereInput } from "../inputs/TokenScalarWhereInput";
import { TokenUpdateManyMutationInput } from "../inputs/TokenUpdateManyMutationInput";

@TypeGraphQL.InputType("TokenUpdateManyWithWhereWithoutAccountInput", {
  isAbstract: true
})
export class TokenUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field(_type => TokenScalarWhereInput, {
    nullable: false
  })
  where!: TokenScalarWhereInput;

  @TypeGraphQL.Field(_type => TokenUpdateManyMutationInput, {
    nullable: false
  })
  data!: TokenUpdateManyMutationInput;
}
