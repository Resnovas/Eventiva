import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmailScalarWhereInput } from "../inputs/EmailScalarWhereInput";
import { EmailUpdateManyMutationInput } from "../inputs/EmailUpdateManyMutationInput";

@TypeGraphQL.InputType("EmailUpdateManyWithWhereWithoutAccountInput", {
  isAbstract: true
})
export class EmailUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field(_type => EmailScalarWhereInput, {
    nullable: false
  })
  where!: EmailScalarWhereInput;

  @TypeGraphQL.Field(_type => EmailUpdateManyMutationInput, {
    nullable: false
  })
  data!: EmailUpdateManyMutationInput;
}
