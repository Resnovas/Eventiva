import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementCreateManyInput } from "../../../inputs/ArrangementCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyArrangementArgs {
  @TypeGraphQL.Field(_type => [ArrangementCreateManyInput], {
    nullable: false
  })
  data!: ArrangementCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
