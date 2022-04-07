import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltWhereInput } from "../../../inputs/SaltWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManySaltArgs {
  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  where?: SaltWhereInput | undefined;
}
