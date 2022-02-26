import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ManagersOnAccountUpdateManyMutationInput } from '../../../inputs/ManagersOnAccountUpdateManyMutationInput';
import { ManagersOnAccountWhereInput } from '../../../inputs/ManagersOnAccountWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyManagersOnAccountArgs {
  @TypeGraphQL.Field((_type) => ManagersOnAccountUpdateManyMutationInput, {
    nullable: false,
  })
  data!: ManagersOnAccountUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereInput, {
    nullable: true,
  })
  where?: ManagersOnAccountWhereInput | undefined;
}
