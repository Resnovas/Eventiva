import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementCreateWithoutRoomInput } from '../inputs/ArrangementCreateWithoutRoomInput';
import { ArrangementWhereUniqueInput } from '../inputs/ArrangementWhereUniqueInput';

@TypeGraphQL.InputType('ArrangementCreateOrConnectWithoutRoomInput', {
  isAbstract: true,
})
export class ArrangementCreateOrConnectWithoutRoomInput {
  @TypeGraphQL.Field((_type) => ArrangementWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ArrangementCreateWithoutRoomInput, {
    nullable: false,
  })
  create!: ArrangementCreateWithoutRoomInput;
}
