import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIACheckWhereUniqueInput } from "../../../inputs/SIACheckWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueSIACheckArgs {
  @TypeGraphQL.Field(_type => SIACheckWhereUniqueInput, {
    nullable: false
  })
  where!: SIACheckWhereUniqueInput;
}
