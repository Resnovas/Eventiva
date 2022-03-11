import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusOnAccountUpdateInput } from "../../../inputs/StatusOnAccountUpdateInput";
import { StatusOnAccountWhereUniqueInput } from "../../../inputs/StatusOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateStatusOnAccountArgs {
  @TypeGraphQL.Field(_type => StatusOnAccountUpdateInput, {
    nullable: false
  })
  data!: StatusOnAccountUpdateInput;

  @TypeGraphQL.Field(_type => StatusOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: StatusOnAccountWhereUniqueInput;
}
