import * as TypeGraphQL from 'type-graphql';

export enum ApplicationOrderByRelevanceFieldEnum {
  id = 'id',
  name = 'name',
  accountId = 'accountId',
}
TypeGraphQL.registerEnumType(ApplicationOrderByRelevanceFieldEnum, {
  name: 'ApplicationOrderByRelevanceFieldEnum',
  description: undefined,
});
