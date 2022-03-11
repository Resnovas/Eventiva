import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/FilesOrderByWithRelationAndSearchRelevanceInput";
import { FilesWhereInput } from "../../../inputs/FilesWhereInput";
import { FilesWhereUniqueInput } from "../../../inputs/FilesWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateFilesArgs {
  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  where?: FilesWhereInput | undefined;

  @TypeGraphQL.Field(_type => [FilesOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: FilesOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => FilesWhereUniqueInput, {
    nullable: true
  })
  cursor?: FilesWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
