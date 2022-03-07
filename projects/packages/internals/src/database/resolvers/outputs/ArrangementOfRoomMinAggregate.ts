import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('ArrangementOfRoomMinAggregate', {
  isAbstract: true,
})
export class ArrangementOfRoomMinAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  roomId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  arrangementId!: string | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  capacity!: number | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;
}
