import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOnAccountOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/StatusOnAccountOrderByWithRelationAndSearchRelevanceInput';
import { StatusOnAccountWhereInput } from '../../../inputs/StatusOnAccountWhereInput';
import { StatusOnAccountWhereUniqueInput } from '../../../inputs/StatusOnAccountWhereUniqueInput';
import { StatusOnAccountScalarFieldEnum } from '../../../../enums/StatusOnAccountScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindManyStatusOnAccountArgs {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereInput, {
    nullable: true,
  })
  where?: StatusOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?:
    | StatusOnAccountOrderByWithRelationAndSearchRelevanceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountWhereUniqueInput, {
    nullable: true,
  })
  cursor?: StatusOnAccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<'statusId' | 'accountId' | 'createdAt' | 'updatedAt' | 'deleted'>
    | undefined;
}
