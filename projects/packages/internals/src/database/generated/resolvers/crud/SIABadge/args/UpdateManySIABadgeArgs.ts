import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIABadgeUpdateManyMutationInput } from "../../../inputs/SIABadgeUpdateManyMutationInput";
import { SIABadgeWhereInput } from "../../../inputs/SIABadgeWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManySIABadgeArgs {
  @TypeGraphQL.Field(_type => SIABadgeUpdateManyMutationInput, {
    nullable: false
  })
  data!: SIABadgeUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => SIABadgeWhereInput, {
    nullable: true
  })
  where?: SIABadgeWhereInput | undefined;
}
