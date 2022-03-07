import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DomainCreateOrConnectWithoutLinkedEmailsInput } from '../inputs/DomainCreateOrConnectWithoutLinkedEmailsInput';
import { DomainCreateWithoutLinkedEmailsInput } from '../inputs/DomainCreateWithoutLinkedEmailsInput';
import { DomainUpdateWithoutLinkedEmailsInput } from '../inputs/DomainUpdateWithoutLinkedEmailsInput';
import { DomainUpsertWithoutLinkedEmailsInput } from '../inputs/DomainUpsertWithoutLinkedEmailsInput';
import { DomainWhereUniqueInput } from '../inputs/DomainWhereUniqueInput';

@TypeGraphQL.InputType('DomainUpdateOneWithoutLinkedEmailsInput', {
  isAbstract: true,
})
export class DomainUpdateOneWithoutLinkedEmailsInput {
  @TypeGraphQL.Field((_type) => DomainCreateWithoutLinkedEmailsInput, {
    nullable: true,
  })
  create?: DomainCreateWithoutLinkedEmailsInput | undefined;

  @TypeGraphQL.Field((_type) => DomainCreateOrConnectWithoutLinkedEmailsInput, {
    nullable: true,
  })
  connectOrCreate?: DomainCreateOrConnectWithoutLinkedEmailsInput | undefined;

  @TypeGraphQL.Field((_type) => DomainUpsertWithoutLinkedEmailsInput, {
    nullable: true,
  })
  upsert?: DomainUpsertWithoutLinkedEmailsInput | undefined;

  @TypeGraphQL.Field((_type) => DomainWhereUniqueInput, {
    nullable: true,
  })
  connect?: DomainWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => DomainUpdateWithoutLinkedEmailsInput, {
    nullable: true,
  })
  update?: DomainUpdateWithoutLinkedEmailsInput | undefined;
}
