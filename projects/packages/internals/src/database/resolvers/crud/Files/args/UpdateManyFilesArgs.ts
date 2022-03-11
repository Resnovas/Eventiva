import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesUpdateManyMutationInput } from "../../../inputs/FilesUpdateManyMutationInput";
import { FilesWhereInput } from "../../../inputs/FilesWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyFilesArgs {
  @TypeGraphQL.Field(_type => FilesUpdateManyMutationInput, {
    nullable: false
  })
  data!: FilesUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  where?: FilesWhereInput | undefined;
}
