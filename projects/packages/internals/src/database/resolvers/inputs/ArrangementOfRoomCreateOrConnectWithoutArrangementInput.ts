import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomCreateWithoutArrangementInput } from '../inputs/ArrangementOfRoomCreateWithoutArrangementInput';
import { ArrangementOfRoomWhereUniqueInput } from '../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.InputType(
  'ArrangementOfRoomCreateOrConnectWithoutArrangementInput',
  {
    isAbstract: true,
  }
)
export class ArrangementOfRoomCreateOrConnectWithoutArrangementInput {
  @TypeGraphQL.Field((_type) => ArrangementOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(
    (_type) => ArrangementOfRoomCreateWithoutArrangementInput,
    {
      nullable: false,
    }
  )
  create!: ArrangementOfRoomCreateWithoutArrangementInput;
}
