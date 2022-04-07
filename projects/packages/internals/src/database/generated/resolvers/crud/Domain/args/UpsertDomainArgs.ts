import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DomainCreateInput } from "../../../inputs/DomainCreateInput";
import { DomainUpdateInput } from "../../../inputs/DomainUpdateInput";
import { DomainWhereUniqueInput } from "../../../inputs/DomainWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertDomainArgs {
  @TypeGraphQL.Field(_type => DomainWhereUniqueInput, {
    nullable: false
  })
  where!: DomainWhereUniqueInput;

  @TypeGraphQL.Field(_type => DomainCreateInput, {
    nullable: false
  })
  create!: DomainCreateInput;

  @TypeGraphQL.Field(_type => DomainUpdateInput, {
    nullable: false
  })
  update!: DomainUpdateInput;
}
