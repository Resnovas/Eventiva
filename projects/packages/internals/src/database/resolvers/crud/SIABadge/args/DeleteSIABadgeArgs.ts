import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIABadgeWhereUniqueInput } from "../../../inputs/SIABadgeWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteSIABadgeArgs {
  @TypeGraphQL.Field(_type => SIABadgeWhereUniqueInput, {
    nullable: false
  })
  where!: SIABadgeWhereUniqueInput;
}
