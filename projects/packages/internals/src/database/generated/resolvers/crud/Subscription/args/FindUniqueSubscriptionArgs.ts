import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionWhereUniqueInput } from "../../../inputs/SubscriptionWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueSubscriptionArgs {
  @TypeGraphQL.Field(_type => SubscriptionWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionWhereUniqueInput;
}
