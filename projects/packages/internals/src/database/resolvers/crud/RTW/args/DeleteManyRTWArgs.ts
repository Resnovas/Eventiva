import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RTWWhereInput } from "../../../inputs/RTWWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyRTWArgs {
  @TypeGraphQL.Field(_type => RTWWhereInput, {
    nullable: true
  })
  where?: RTWWhereInput | undefined;
}
