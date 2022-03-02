import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountCreateManySubuserInputEnvelope } from '../inputs/SubuserOnAccountCreateManySubuserInputEnvelope';
import { SubuserOnAccountCreateOrConnectWithoutSubuserInput } from '../inputs/SubuserOnAccountCreateOrConnectWithoutSubuserInput';
import { SubuserOnAccountCreateWithoutSubuserInput } from '../inputs/SubuserOnAccountCreateWithoutSubuserInput';
import { SubuserOnAccountWhereUniqueInput } from '../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('SubuserOnAccountCreateNestedManyWithoutSubuserInput', {
  isAbstract: true,
})
export class SubuserOnAccountCreateNestedManyWithoutSubuserInput {
  @TypeGraphQL.Field((_type) => [SubuserOnAccountCreateWithoutSubuserInput], {
    nullable: true,
  })
  create?: SubuserOnAccountCreateWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountCreateOrConnectWithoutSubuserInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | SubuserOnAccountCreateOrConnectWithoutSubuserInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => SubuserOnAccountCreateManySubuserInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: SubuserOnAccountCreateManySubuserInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: SubuserOnAccountWhereUniqueInput[] | undefined;
}
