import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfRoomWhereInput } from '../../../inputs/FeatureOfRoomWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyFeatureOfRoomArgs {
  @TypeGraphQL.Field((_type) => FeatureOfRoomWhereInput, {
    nullable: true,
  })
  where?: FeatureOfRoomWhereInput | undefined;
}
