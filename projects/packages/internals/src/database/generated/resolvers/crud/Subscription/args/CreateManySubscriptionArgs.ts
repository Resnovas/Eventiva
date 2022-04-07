import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubscriptionCreateManyInput } from "../../../inputs/SubscriptionCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManySubscriptionArgs {
  @TypeGraphQL.Field(_type => [SubscriptionCreateManyInput], {
    nullable: false
  })
  data!: SubscriptionCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
