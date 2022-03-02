import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWCreateManyAccountInput } from '../inputs/RTWCreateManyAccountInput';

@TypeGraphQL.InputType('RTWCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class RTWCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [RTWCreateManyAccountInput], {
    nullable: false,
  })
  data!: RTWCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
