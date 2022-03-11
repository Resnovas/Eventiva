import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/FilesOrderByWithRelationAndSearchRelevanceInput";
import { FilesWhereInput } from "../../../inputs/FilesWhereInput";
import { FilesWhereUniqueInput } from "../../../inputs/FilesWhereUniqueInput";
import { FilesScalarFieldEnum } from "../../../../enums/FilesScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class AccountFilesArgs {
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

  @TypeGraphQL.Field(_type => [FilesScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "name" | "rtwId" | "createdAt" | "updatedAt" | "deleted"> | undefined;
}
