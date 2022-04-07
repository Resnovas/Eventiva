import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubuserOnAccountUpdateManyMutationInput } from "../../../inputs/SubuserOnAccountUpdateManyMutationInput";
import { SubuserOnAccountWhereInput } from "../../../inputs/SubuserOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManySubuserOnAccountArgs {
  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: SubuserOnAccountUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => SubuserOnAccountWhereInput, {
    nullable: true
  })
  where?: SubuserOnAccountWhereInput | undefined;
}
