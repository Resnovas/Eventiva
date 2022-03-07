import * as TypeGraphQL from 'type-graphql';

export enum ArrangementOrderByRelevanceFieldEnum {
  id = 'id',
  name = 'name',
  icon = 'icon',
  details = 'details',
}
TypeGraphQL.registerEnumType(ArrangementOrderByRelevanceFieldEnum, {
  name: 'ArrangementOrderByRelevanceFieldEnum',
  description: undefined,
});
