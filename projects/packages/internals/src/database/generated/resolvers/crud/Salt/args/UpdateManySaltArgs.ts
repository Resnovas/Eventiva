import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltUpdateManyMutationInput } from "../../../inputs/SaltUpdateManyMutationInput";
import { SaltWhereInput } from "../../../inputs/SaltWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManySaltArgs {
  @TypeGraphQL.Field(_type => SaltUpdateManyMutationInput, {
    nullable: false
  })
  data!: SaltUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  where?: SaltWhereInput | undefined;
}
