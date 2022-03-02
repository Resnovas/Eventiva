import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementWhereInput } from '../../../inputs/ArrangementWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyArrangementArgs {
  @TypeGraphQL.Field((_type) => ArrangementWhereInput, {
    nullable: true,
  })
  where?: ArrangementWhereInput | undefined;
}
