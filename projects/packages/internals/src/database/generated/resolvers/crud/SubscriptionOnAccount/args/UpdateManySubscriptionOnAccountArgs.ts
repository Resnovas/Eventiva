import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountUpdateManyMutationInput } from "../../../inputs/SubscriptionOnAccountUpdateManyMutationInput";
import { SubscriptionOnAccountWhereInput } from "../../../inputs/SubscriptionOnAccountWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManySubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountUpdateManyMutationInput, {
    nullable: false
  })
  data!: SubscriptionOnAccountUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereInput, {
    nullable: true
  })
  where?: SubscriptionOnAccountWhereInput | undefined;
}
