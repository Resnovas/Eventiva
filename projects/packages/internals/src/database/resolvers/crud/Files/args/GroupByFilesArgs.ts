import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FilesOrderByWithAggregationInput } from "../../../inputs/FilesOrderByWithAggregationInput";
import { FilesScalarWhereWithAggregatesInput } from "../../../inputs/FilesScalarWhereWithAggregatesInput";
import { FilesWhereInput } from "../../../inputs/FilesWhereInput";
import { FilesScalarFieldEnum } from "../../../../enums/FilesScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByFilesArgs {
  @TypeGraphQL.Field(_type => FilesWhereInput, {
    nullable: true
  })
  where?: FilesWhereInput | undefined;

  @TypeGraphQL.Field(_type => [FilesOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: FilesOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "name" | "rtwId" | "createdAt" | "updatedAt" | "deleted">;

  @TypeGraphQL.Field(_type => FilesScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: FilesScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
