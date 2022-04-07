import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesCreateInput } from "../../../inputs/FilesCreateInput";

@TypeGraphQL.ArgsType()
export class CreateFilesArgs {
  @TypeGraphQL.Field(_type => FilesCreateInput, {
    nullable: false
  })
  data!: FilesCreateInput;
}
