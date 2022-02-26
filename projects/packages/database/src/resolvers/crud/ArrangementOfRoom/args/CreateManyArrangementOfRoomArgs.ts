import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementOfRoomCreateManyInput } from '../../../inputs/ArrangementOfRoomCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyArrangementOfRoomArgs {
  @TypeGraphQL.Field((_type) => [ArrangementOfRoomCreateManyInput], {
    nullable: false,
  })
  data!: ArrangementOfRoomCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
