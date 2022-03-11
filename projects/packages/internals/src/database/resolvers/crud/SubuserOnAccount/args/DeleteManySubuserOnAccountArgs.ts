import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubuserOnAccountWhereInput } from "../../../inputs/SubuserOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManySubuserOnAccountArgs {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereInput, {
    nullable: true
  })
  where?: SubuserOnAccountWhereInput | undefined;
}
