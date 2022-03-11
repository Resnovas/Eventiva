import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusUpdateManyMutationInput } from "../../../inputs/StatusUpdateManyMutationInput";
import { StatusWhereInput } from "../../../inputs/StatusWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyStatusArgs {
  @TypeGraphQL.Field(_type => StatusUpdateManyMutationInput, {
    nullable: false
  })
  data!: StatusUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => StatusWhereInput, {
    nullable: true
  })
  where?: StatusWhereInput | undefined;
}
