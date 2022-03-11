import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusOnAccountUpdateManyMutationInput } from "../../../inputs/StatusOnAccountUpdateManyMutationInput";
import { StatusOnAccountWhereInput } from "../../../inputs/StatusOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyStatusOnAccountArgs {
  @TypeGraphQL.Field(_type => StatusOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: StatusOnAccountUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => StatusOnAccountWhereInput, {
    nullable: true
  })
  where?: StatusOnAccountWhereInput | undefined;
}
