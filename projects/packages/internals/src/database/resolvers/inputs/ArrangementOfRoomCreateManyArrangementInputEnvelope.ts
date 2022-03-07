import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomCreateManyArrangementInput } from '../inputs/ArrangementOfRoomCreateManyArrangementInput';

@TypeGraphQL.InputType('ArrangementOfRoomCreateManyArrangementInputEnvelope', {
  isAbstract: true,
})
export class ArrangementOfRoomCreateManyArrangementInputEnvelope {
  @TypeGraphQL.Field((_type) => [ArrangementOfRoomCreateManyArrangementInput], {
    nullable: false,
  })
  data!: ArrangementOfRoomCreateManyArrangementInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
