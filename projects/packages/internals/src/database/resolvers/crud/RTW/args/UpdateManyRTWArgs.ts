import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWUpdateManyMutationInput } from '../../../inputs/RTWUpdateManyMutationInput';
import { RTWWhereInput } from '../../../inputs/RTWWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyRTWArgs {
  @TypeGraphQL.Field((_type) => RTWUpdateManyMutationInput, {
    nullable: false,
  })
  data!: RTWUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => RTWWhereInput, {
    nullable: true,
  })
  where?: RTWWhereInput | undefined;
}
