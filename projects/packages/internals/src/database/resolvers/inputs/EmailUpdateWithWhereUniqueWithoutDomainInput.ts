import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailUpdateWithoutDomainInput } from '../inputs/EmailUpdateWithoutDomainInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailUpdateWithWhereUniqueWithoutDomainInput', {
  isAbstract: true,
})
export class EmailUpdateWithWhereUniqueWithoutDomainInput {
  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: false,
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmailUpdateWithoutDomainInput, {
    nullable: false,
  })
  data!: EmailUpdateWithoutDomainInput;
}
