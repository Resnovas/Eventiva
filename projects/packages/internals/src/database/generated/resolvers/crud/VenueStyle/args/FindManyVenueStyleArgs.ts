import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { VenueStyleOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/VenueStyleOrderByWithRelationAndSearchRelevanceInput";
import { VenueStyleWhereInput } from "../../../inputs/VenueStyleWhereInput";
import { VenueStyleWhereUniqueInput } from "../../../inputs/VenueStyleWhereUniqueInput";
import { VenueStyleScalarFieldEnum } from "../../../../enums/VenueStyleScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindManyVenueStyleArgs {
  @TypeGraphQL.Field(_type => VenueStyleWhereInput, {
    nullable: true
  })
  where?: VenueStyleWhereInput | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: VenueStyleOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => VenueStyleWhereUniqueInput, {
    nullable: true
  })
  cursor?: VenueStyleWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [VenueStyleScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "createdAt" | "updatedAt" | "name" | "details" | "deletedDate" | "deleted"> | undefined;
}
