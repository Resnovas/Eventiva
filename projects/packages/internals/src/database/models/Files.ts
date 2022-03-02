import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Account } from '../models/Account';
import { RTW } from '../models/RTW';
import { FilesCount } from '../resolvers/outputs/FilesCount';

@TypeGraphQL.ObjectType('Files', {
  isAbstract: true,
})
export class Files {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  rtw?: RTW | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  rtwId?: string | null;

  account?: Account[];

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | null;

  @TypeGraphQL.Field((_type) => FilesCount, {
    nullable: true,
  })
  _count?: FilesCount | null;
}
