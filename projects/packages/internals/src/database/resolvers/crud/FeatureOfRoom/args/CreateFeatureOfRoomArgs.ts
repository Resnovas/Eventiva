import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfRoomCreateInput } from '../../../inputs/FeatureOfRoomCreateInput';

@TypeGraphQL.ArgsType()
export class CreateFeatureOfRoomArgs {
  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateInput, {
    nullable: false,
  })
  data!: FeatureOfRoomCreateInput;
}
