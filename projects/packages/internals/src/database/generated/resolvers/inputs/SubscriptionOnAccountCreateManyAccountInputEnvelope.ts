import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateManyAccountInput } from "../inputs/SubscriptionOnAccountCreateManyAccountInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateManyAccountInputEnvelope", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateManyAccountInput], {
    nullable: false
  })
  data!: SubscriptionOnAccountCreateManyAccountInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
