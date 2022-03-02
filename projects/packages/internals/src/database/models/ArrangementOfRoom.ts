import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Arrangement } from '../models/Arrangement';
import { Room } from '../models/Room';

@TypeGraphQL.ObjectType('ArrangementOfRoom', {
  isAbstract: true,
})
export class ArrangementOfRoom {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  roomId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  arrangementId!: string;

  arrangement?: Arrangement;

  room?: Room;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  capacity!: number;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details?: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;
}
