import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountWhereInput } from "../../../inputs/ManagersOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyManagersOnAccountArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereInput, {
    nullable: true
  })
  where?: ManagersOnAccountWhereInput | undefined;
}
