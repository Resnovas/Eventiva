import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateManyDomainInputEnvelope } from '../inputs/EmailCreateManyDomainInputEnvelope';
import { EmailCreateOrConnectWithoutDomainInput } from '../inputs/EmailCreateOrConnectWithoutDomainInput';
import { EmailCreateWithoutDomainInput } from '../inputs/EmailCreateWithoutDomainInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailCreateNestedManyWithoutDomainInput', {
  isAbstract: true,
})
export class EmailCreateNestedManyWithoutDomainInput {
  @TypeGraphQL.Field((_type) => [EmailCreateWithoutDomainInput], {
    nullable: true,
  })
  create?: EmailCreateWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailCreateOrConnectWithoutDomainInput], {
    nullable: true,
  })
  connectOrCreate?: EmailCreateOrConnectWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => EmailCreateManyDomainInputEnvelope, {
    nullable: true,
  })
  createMany?: EmailCreateManyDomainInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [EmailWhereUniqueInput], {
    nullable: true,
  })
  connect?: EmailWhereUniqueInput[] | undefined;
}
