import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusOnAccountWhereUniqueInput } from "../../../inputs/StatusOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteStatusOnAccountArgs {
  @TypeGraphQL.Field(_type => StatusOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: StatusOnAccountWhereUniqueInput;
}
