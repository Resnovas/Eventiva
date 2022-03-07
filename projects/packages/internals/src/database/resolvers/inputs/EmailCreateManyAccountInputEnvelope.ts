import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateManyAccountInput } from '../inputs/EmailCreateManyAccountInput';

@TypeGraphQL.InputType('EmailCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class EmailCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [EmailCreateManyAccountInput], {
    nullable: false,
  })
  data!: EmailCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
