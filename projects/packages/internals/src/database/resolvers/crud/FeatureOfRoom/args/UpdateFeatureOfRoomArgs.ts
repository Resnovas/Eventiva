import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfRoomUpdateInput } from '../../../inputs/FeatureOfRoomUpdateInput';
import { FeatureOfRoomWhereUniqueInput } from '../../../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateFeatureOfRoomArgs {
  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateInput, {
    nullable: false,
  })
  data!: FeatureOfRoomUpdateInput;

  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfRoomWhereUniqueInput;
}
