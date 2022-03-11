import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountWhereInput } from "../../../inputs/EmployersOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereInput, {
    nullable: true
  })
  where?: EmployersOnAccountWhereInput | undefined;
}
