import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementOfRoomUpdateInput } from '../../../inputs/ArrangementOfRoomUpdateInput';
import { ArrangementOfRoomWhereUniqueInput } from '../../../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateArrangementOfRoomArgs {
  @TypeGraphQL.Field((_type) => ArrangementOfRoomUpdateInput, {
    nullable: false,
  })
  data!: ArrangementOfRoomUpdateInput;

  @TypeGraphQL.Field((_type) => ArrangementOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementOfRoomWhereUniqueInput;
}
