import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput';
import { SubuserOnAccountWhereInput } from '../../../inputs/SubuserOnAccountWhereInput';
import { SubuserOnAccountWhereUniqueInput } from '../../../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateSubuserOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereInput, {
    nullable: true,
  })
  where?: SubuserOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?:
    | SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: true,
  })
  cursor?: SubuserOnAccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
