import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput";
import { FeatureOfRoomWhereInput } from "../../../inputs/FeatureOfRoomWhereInput";
import { FeatureOfRoomWhereUniqueInput } from "../../../inputs/FeatureOfRoomWhereUniqueInput";
import { FeatureOfRoomScalarFieldEnum } from "../../../../enums/FeatureOfRoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindManyFeatureOfRoomArgs {
  @TypeGraphQL.Field(_type => FeatureOfRoomWhereInput, {
    nullable: true
  })
  where?: FeatureOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomWhereUniqueInput, {
    nullable: true
  })
  cursor?: FeatureOfRoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [FeatureOfRoomScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"roomId" | "featureId" | "data" | "createdAt" | "updatedAt" | "deletedDate" | "deleted"> | undefined;
}
