import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCreateOrConnectWithoutAccountInput } from '../inputs/StatusCreateOrConnectWithoutAccountInput';
import { StatusCreateWithoutAccountInput } from '../inputs/StatusCreateWithoutAccountInput';
import { StatusUpdateWithoutAccountInput } from '../inputs/StatusUpdateWithoutAccountInput';
import { StatusUpsertWithoutAccountInput } from '../inputs/StatusUpsertWithoutAccountInput';
import { StatusWhereUniqueInput } from '../inputs/StatusWhereUniqueInput';

@TypeGraphQL.InputType('StatusUpdateOneRequiredWithoutAccountInput', {
  isAbstract: true,
})
export class StatusUpdateOneRequiredWithoutAccountInput {
  @TypeGraphQL.Field((_type) => StatusCreateWithoutAccountInput, {
    nullable: true,
  })
  create?: StatusCreateWithoutAccountInput | undefined;

  @TypeGraphQL.Field((_type) => StatusCreateOrConnectWithoutAccountInput, {
    nullable: true,
  })
  connectOrCreate?: StatusCreateOrConnectWithoutAccountInput | undefined;

  @TypeGraphQL.Field((_type) => StatusUpsertWithoutAccountInput, {
    nullable: true,
  })
  upsert?: StatusUpsertWithoutAccountInput | undefined;

  @TypeGraphQL.Field((_type) => StatusWhereUniqueInput, {
    nullable: true,
  })
  connect?: StatusWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => StatusUpdateWithoutAccountInput, {
    nullable: true,
  })
  update?: StatusUpdateWithoutAccountInput | undefined;
}
