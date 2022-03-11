import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusUpdateInput } from "../../../inputs/StatusUpdateInput";
import { StatusWhereUniqueInput } from "../../../inputs/StatusWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateStatusArgs {
  @TypeGraphQL.Field(_type => StatusUpdateInput, {
    nullable: false
  })
  data!: StatusUpdateInput;

  @TypeGraphQL.Field(_type => StatusWhereUniqueInput, {
    nullable: false
  })
  where!: StatusWhereUniqueInput;
}
