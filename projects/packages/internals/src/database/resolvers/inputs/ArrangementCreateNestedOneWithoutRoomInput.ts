import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementCreateOrConnectWithoutRoomInput } from '../inputs/ArrangementCreateOrConnectWithoutRoomInput';
import { ArrangementCreateWithoutRoomInput } from '../inputs/ArrangementCreateWithoutRoomInput';
import { ArrangementWhereUniqueInput } from '../inputs/ArrangementWhereUniqueInput';

@TypeGraphQL.InputType('ArrangementCreateNestedOneWithoutRoomInput', {
  isAbstract: true,
})
export class ArrangementCreateNestedOneWithoutRoomInput {
  @TypeGraphQL.Field((_type) => ArrangementCreateWithoutRoomInput, {
    nullable: true,
  })
  create?: ArrangementCreateWithoutRoomInput | undefined;

  @TypeGraphQL.Field((_type) => ArrangementCreateOrConnectWithoutRoomInput, {
    nullable: true,
  })
  connectOrCreate?: ArrangementCreateOrConnectWithoutRoomInput | undefined;

  @TypeGraphQL.Field((_type) => ArrangementWhereUniqueInput, {
    nullable: true,
  })
  connect?: ArrangementWhereUniqueInput | undefined;
}
