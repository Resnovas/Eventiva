import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementCreateInput } from "../../../inputs/ArrangementCreateInput";
import { ArrangementUpdateInput } from "../../../inputs/ArrangementUpdateInput";
import { ArrangementWhereUniqueInput } from "../../../inputs/ArrangementWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertArrangementArgs {
  @TypeGraphQL.Field(_type => ArrangementWhereUniqueInput, {
    nullable: false
  })
  where!: ArrangementWhereUniqueInput;

  @TypeGraphQL.Field(_type => ArrangementCreateInput, {
    nullable: false
  })
  create!: ArrangementCreateInput;

  @TypeGraphQL.Field(_type => ArrangementUpdateInput, {
    nullable: false
  })
  update!: ArrangementUpdateInput;
}
