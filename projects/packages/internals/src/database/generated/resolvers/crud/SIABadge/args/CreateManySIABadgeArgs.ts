import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIABadgeCreateManyInput } from "../../../inputs/SIABadgeCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManySIABadgeArgs {
  @TypeGraphQL.Field(_type => [SIABadgeCreateManyInput], {
    nullable: false
  })
  data!: SIABadgeCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
