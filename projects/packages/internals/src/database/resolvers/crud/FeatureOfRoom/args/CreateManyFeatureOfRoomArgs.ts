import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfRoomCreateManyInput } from '../../../inputs/FeatureOfRoomCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyFeatureOfRoomArgs {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomCreateManyInput], {
    nullable: false,
  })
  data!: FeatureOfRoomCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
