import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateManyDomainInput } from '../inputs/EmailCreateManyDomainInput';

@TypeGraphQL.InputType('EmailCreateManyDomainInputEnvelope', {
  isAbstract: true,
})
export class EmailCreateManyDomainInputEnvelope {
  @TypeGraphQL.Field((_type) => [EmailCreateManyDomainInput], {
    nullable: false,
  })
  data!: EmailCreateManyDomainInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
