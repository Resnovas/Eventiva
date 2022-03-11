import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateManySubscriptionInput } from "../inputs/SubscriptionOnAccountCreateManySubscriptionInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateManySubscriptionInputEnvelope", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateManySubscriptionInputEnvelope {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateManySubscriptionInput], {
    nullable: false
  })
  data!: SubscriptionOnAccountCreateManySubscriptionInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
