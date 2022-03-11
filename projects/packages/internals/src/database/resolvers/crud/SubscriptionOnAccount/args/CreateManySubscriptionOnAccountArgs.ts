import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionOnAccountCreateManyInput } from "../../../inputs/SubscriptionOnAccountCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManySubscriptionOnAccountArgs {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateManyInput], {
    nullable: false
  })
  data!: SubscriptionOnAccountCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
