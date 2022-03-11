import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DomainWhereInput } from "../../../inputs/DomainWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyDomainArgs {
  @TypeGraphQL.Field(_type => DomainWhereInput, {
    nullable: true
  })
  where?: DomainWhereInput | undefined;
}
