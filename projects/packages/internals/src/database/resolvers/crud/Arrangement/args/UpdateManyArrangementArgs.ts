import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementUpdateManyMutationInput } from '../../../inputs/ArrangementUpdateManyMutationInput';
import { ArrangementWhereInput } from '../../../inputs/ArrangementWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManyArrangementArgs {
  @TypeGraphQL.Field((_type) => ArrangementUpdateManyMutationInput, {
    nullable: false,
  })
  data!: ArrangementUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => ArrangementWhereInput, {
    nullable: true,
  })
  where?: ArrangementWhereInput | undefined;
}
