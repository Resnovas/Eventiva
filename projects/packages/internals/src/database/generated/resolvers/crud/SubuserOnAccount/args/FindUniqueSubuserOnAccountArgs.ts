import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubuserOnAccountWhereUniqueInput } from "../../../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueSubuserOnAccountArgs {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubuserOnAccountWhereUniqueInput;
}
