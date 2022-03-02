import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementOfRoomCreateInput } from '../../../inputs/ArrangementOfRoomCreateInput';
import { ArrangementOfRoomUpdateInput } from '../../../inputs/ArrangementOfRoomUpdateInput';
import { ArrangementOfRoomWhereUniqueInput } from '../../../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertArrangementOfRoomArgs {
  @TypeGraphQL.Field((_type) => ArrangementOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ArrangementOfRoomCreateInput, {
    nullable: false,
  })
  create!: ArrangementOfRoomCreateInput;

  @TypeGraphQL.Field((_type) => ArrangementOfRoomUpdateInput, {
    nullable: false,
  })
  update!: ArrangementOfRoomUpdateInput;
}
