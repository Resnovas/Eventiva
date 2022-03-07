import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomUpdateWithoutArrangementInput } from '../inputs/ArrangementOfRoomUpdateWithoutArrangementInput';
import { ArrangementOfRoomWhereUniqueInput } from '../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.InputType(
  'ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput',
  {
    isAbstract: true,
  }
)
export class ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput {
  @TypeGraphQL.Field((_type) => ArrangementOfRoomWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(
    (_type) => ArrangementOfRoomUpdateWithoutArrangementInput,
    {
      nullable: false,
    }
  )
  data!: ArrangementOfRoomUpdateWithoutArrangementInput;
}
