import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RoomCreateManyInput } from '../../../inputs/RoomCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyRoomArgs {
  @TypeGraphQL.Field((_type) => [RoomCreateManyInput], {
    nullable: false,
  })
  data!: RoomCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
