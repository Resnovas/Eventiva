import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionWhereInput } from "../inputs/SubscriptionWhereInput";

@TypeGraphQL.InputType("SubscriptionRelationFilter", {
  isAbstract: true
})
export class SubscriptionRelationFilter {
  @TypeGraphQL.Field(_type => SubscriptionWhereInput, {
    nullable: true
  })
  is?: SubscriptionWhereInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionWhereInput, {
    nullable: true
  })
  isNot?: SubscriptionWhereInput | undefined;
}
