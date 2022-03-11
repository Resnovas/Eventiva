import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomOrderByWithAggregationInput } from "../../../inputs/RoomOrderByWithAggregationInput";
import { RoomScalarWhereWithAggregatesInput } from "../../../inputs/RoomScalarWhereWithAggregatesInput";
import { RoomWhereInput } from "../../../inputs/RoomWhereInput";
import { RoomScalarFieldEnum } from "../../../../enums/RoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByRoomArgs {
  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  where?: RoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [RoomOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: RoomOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "createdAt" | "updatedAt" | "deleted" | "addressId" | "name" | "floor" | "building" | "accessibility" | "checkin" | "checkout" | "length" | "width" | "height">;

  @TypeGraphQL.Field(_type => RoomScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: RoomScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
