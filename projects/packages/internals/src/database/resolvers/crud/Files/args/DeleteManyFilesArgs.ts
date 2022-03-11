import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesWhereInput } from "../../../inputs/FilesWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyFilesArgs {
  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  where?: FilesWhereInput | undefined;
}
