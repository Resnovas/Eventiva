import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('ArrangementOfRoomCreateManyRoomInput', {
  isAbstract: true,
})
export class ArrangementOfRoomCreateManyRoomInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  arrangementId!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  capacity!: number;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;
}
