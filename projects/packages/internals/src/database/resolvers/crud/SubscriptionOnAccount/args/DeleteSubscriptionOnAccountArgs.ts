import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountWhereUniqueInput } from "../../../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteSubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionOnAccountWhereUniqueInput;
}
