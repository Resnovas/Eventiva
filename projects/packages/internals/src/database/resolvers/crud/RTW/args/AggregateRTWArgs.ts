import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/RTWOrderByWithRelationAndSearchRelevanceInput';
import { RTWWhereInput } from '../../../inputs/RTWWhereInput';
import { RTWWhereUniqueInput } from '../../../inputs/RTWWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateRTWArgs {
  @TypeGraphQL.Field((_type) => RTWWhereInput, {
    nullable: true,
  })
  where?: RTWWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [RTWOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: RTWOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: true,
  })
  cursor?: RTWWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}