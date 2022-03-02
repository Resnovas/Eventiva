import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementOfRoomWhereUniqueInput } from '../../../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueArrangementOfRoomArgs {
  @TypeGraphQL.Field((_type) => ArrangementOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementOfRoomWhereUniqueInput;
}
