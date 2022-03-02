import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyEmployerInputEnvelope } from '../inputs/EmployersOnAccountCreateManyEmployerInputEnvelope';
import { EmployersOnAccountCreateOrConnectWithoutEmployerInput } from '../inputs/EmployersOnAccountCreateOrConnectWithoutEmployerInput';
import { EmployersOnAccountCreateWithoutEmployerInput } from '../inputs/EmployersOnAccountCreateWithoutEmployerInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'EmployersOnAccountCreateNestedManyWithoutEmployerInput',
  {
    isAbstract: true,
  }
)
export class EmployersOnAccountCreateNestedManyWithoutEmployerInput {
  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  create?: EmployersOnAccountCreateWithoutEmployerInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateOrConnectWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | EmployersOnAccountCreateOrConnectWithoutEmployerInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountCreateManyEmployerInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: EmployersOnAccountCreateManyEmployerInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: EmployersOnAccountWhereUniqueInput[] | undefined;
}
