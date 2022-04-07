import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIACheckUpdateInput } from "../../../inputs/SIACheckUpdateInput";
import { SIACheckWhereUniqueInput } from "../../../inputs/SIACheckWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateSIACheckArgs {
  @TypeGraphQL.Field(_type => SIACheckUpdateInput, {
    nullable: false
  })
  data!: SIACheckUpdateInput;

  @TypeGraphQL.Field(_type => SIACheckWhereUniqueInput, {
    nullable: false
  })
  where!: SIACheckWhereUniqueInput;
}
