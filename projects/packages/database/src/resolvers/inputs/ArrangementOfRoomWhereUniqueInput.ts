import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput } from '../inputs/ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput';

@TypeGraphQL.InputType('ArrangementOfRoomWhereUniqueInput', {
  isAbstract: true,
})
export class ArrangementOfRoomWhereUniqueInput {
  @TypeGraphQL.Field(
    (_type) => ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput,
    {
      nullable: true,
    }
  )
  roomId_arrangementId?:
    | ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput
    | undefined;
}
