import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckCreateManyBadgeInput } from "../inputs/SIACheckCreateManyBadgeInput";

@TypeGraphQL.InputType("SIACheckCreateManyBadgeInputEnvelope", {
  isAbstract: true
})
export class SIACheckCreateManyBadgeInputEnvelope {
  @TypeGraphQL.Field(_type => [SIACheckCreateManyBadgeInput], {
    nullable: false
  })
  data!: SIACheckCreateManyBadgeInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
