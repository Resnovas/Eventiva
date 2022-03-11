import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIACheckCreateManyInput } from "../../../inputs/SIACheckCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManySIACheckArgs {
  @TypeGraphQL.Field(_type => [SIACheckCreateManyInput], {
    nullable: false
  })
  data!: SIACheckCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
