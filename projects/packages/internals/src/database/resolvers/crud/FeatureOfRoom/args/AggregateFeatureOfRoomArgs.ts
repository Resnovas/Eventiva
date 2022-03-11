import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput";
import { FeatureOfRoomWhereInput } from "../../../inputs/FeatureOfRoomWhereInput";
import { FeatureOfRoomWhereUniqueInput } from "../../../inputs/FeatureOfRoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateFeatureOfRoomArgs {
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
}
