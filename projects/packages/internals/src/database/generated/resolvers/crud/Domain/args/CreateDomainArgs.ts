import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DomainCreateInput } from "../../../inputs/DomainCreateInput";

@TypeGraphQL.ArgsType()
export class CreateDomainArgs {
  @TypeGraphQL.Field(_type => DomainCreateInput, {
    nullable: false
  })
  data!: DomainCreateInput;
}
