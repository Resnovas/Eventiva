import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmailUpdateManyMutationInput } from "../../../inputs/EmailUpdateManyMutationInput";
import { EmailWhereInput } from "../../../inputs/EmailWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyEmailArgs {
  @TypeGraphQL.Field(_type => EmailUpdateManyMutationInput, {
    nullable: false
  })
  data!: EmailUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => EmailWhereInput, {
    nullable: true
  })
  where?: EmailWhereInput | undefined;
}
