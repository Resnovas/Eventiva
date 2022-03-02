import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType(
  'ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput',
  {
    isAbstract: true,
  }
)
export class ArrangementOfRoomRoomIdArrangementIdCompoundUniqueInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  roomId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  arrangementId!: string;
}
