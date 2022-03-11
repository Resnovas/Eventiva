import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountUpdateManyMutationInput } from "../../../inputs/EmployersOnAccountUpdateManyMutationInput";
import { EmployersOnAccountWhereInput } from "../../../inputs/EmployersOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: EmployersOnAccountUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountWhereInput, {
    nullable: true
  })
  where?: EmployersOnAccountWhereInput | undefined;
}
